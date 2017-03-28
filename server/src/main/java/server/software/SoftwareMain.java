package server.software;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

import libSpline.*;
import libGeometry.*;
import libMath.*;

import com.google.gson.Gson;

public class SoftwareMain {

    private Mappa source;
    private Mappa target;
    private double angolo;
    private double sigma;
    private double distanza;
    private int iterazioni;
    private TabellaRelazioneLivelli tabellaRelazioneLivelli;

    public SoftwareMain() {
    }

    private String stimaSpline(Mappa source, Mappa target, int filtro, int numeroIterazioni) {
        ArrayList<Punto3d> datiX = new ArrayList();
        ArrayList<Punto3d> datiY = new ArrayList();
        for (int c = 0; c < source.getNumeroPuntiOmologhi(); c++) {
            Punto3d puntoTarget = target.getPuntoOmologo(c);
            Punto3d puntoSource = source.getPuntoOmologo(c);
            datiX.add(puntoSource.deltaX(puntoTarget));
            datiY.add(puntoSource.deltaY(puntoTarget));
        }
        MultiSpline multiX = new MultiSpline(datiX, source.getBoundingBox());
        MultiSpline multiY = new MultiSpline(datiY, source.getBoundingBox());
        multiX.setFiltro(filtro);
        multiY.setFiltro(filtro);
        Matrix risultati;
        double Fo;
        int c = 0;
        risultati = new Matrix(numeroIterazioni, 7);
        boolean ripetiX = true;
        boolean ripetiY = true;
        while ((ripetiX || ripetiY) && c < numeroIterazioni) {
            if (c > 0) {
                if (ripetiX) {
                    multiX.aggiungiLivello();
                }
                if (ripetiY) {
                    multiY.aggiungiLivello();
                }
            }
            if (ripetiX) {
                if (multiX.calcolaMultiSpline() == 0) {
                    multiX.interpolaSuOsservazioni();
                } else {
                    ripetiX = false;
                }
            }
            if ((c > 0) && (ripetiX) && (risultati.get(c, 1) == risultati.get(c - 1, 1))) {
                ripetiX = false;
                multiX.eliminaLivello();
                multiX.calcolaMultiSpline();
            }
            double varianzaX = multiX.getScarti().stimaVarianza(multiX.getNumeroParametri());
            risultati.set(c, 0, multiX.getNumeroSpline());
            risultati.set(c, 1, varianzaX);
            if (c > 0) {
                int N = multiX.getScarti().getRowDimension();
                int n1 = (int) risultati.get(c - 1, 0);
                int n1n2 = multiX.getNumeroSpline();
                int n2 = n1n2 - n1;
                double varianzaX_1 = risultati.get(c - 1, 1);
                double num = (N - n1) * varianzaX_1 - (N - n1n2) * varianzaX;
                double denum = n2 * varianzaX;
                Fo = num / denum;
                risultati.set(c, 2, Fo);
                int n_Degrees = n2;
                int d_Degrees = N - n1 - n2;
                FisherDistribution fDis = new FisherDistribution(n_Degrees, d_Degrees);
                Domain dominio = fDis.getDomain();
                double min = dominio.getLowerBound();
                double max = dominio.getUpperBound();
                fDis.setParameters(min, max, 0.01, 1);
                double Fteorico = fDis.getQuantile(1 - 0.025);
                risultati.set(c, 6, Fteorico);
            }
            if (ripetiY) {
                if (multiY.calcolaMultiSpline() == 0) {
                    multiY.interpolaSuOsservazioni();
                } else {
                    ripetiY = false;
                }
            }
            if ((c > 0) && (ripetiY) && (risultati.get(c, 3) == risultati.get(c - 1, 3))) {
                ripetiY = false;
                multiY.eliminaLivello();
                multiY.calcolaMultiSpline();
            }
            double varianza_Y = multiY.getScarti().stimaVarianza(multiY.getNumeroParametri());
            risultati.set(c, 3, multiY.getNumeroSpline());
            risultati.set(c, 4, varianza_Y);
            if (c > 0) {
                int N = multiX.getScarti().getRowDimension();
                int n1 = (int) risultati.get(c - 1, 3);
                int n1n2 = multiY.getNumeroSpline();
                int n2 = n1n2 - n1;
                double varianzaY_1 = risultati.get(c - 1, 4);
                double num = (N - n1) * varianzaY_1 - (N - n1n2) * varianza_Y;
                double denum = n2 * varianza_Y;
                Fo = num / denum;
                risultati.set(c, 5, Fo);
            }
            c++;
        }
        Trasforma.conSpline(source, multiX, multiY);
        return ("splineX;var(X);Fo(X);SplineY;var(Y);Fo(Y);Fteorico\r\n" + risultati.stampa());
    }

    public String stimaAffine(Mappa source, Mappa target, int numeroIterazioni, double angolo, double sigma, double distanzaMax, TabellaRelazioneLivelli tabellaRelazioneLivelli, boolean transform) {
        boolean ripeti = true;
        int numeroIterazione = 0;
        Matrix parametriStimati = null;
        Mappa output;
        Matrix risultato = new Matrix(numeroIterazioni, 8);
        while (ripeti && numeroIterazione < numeroIterazioni) {
            parametriStimati = Stima.calcolaParametri(source.getPuntiOmologhi(), target.getPuntiOmologhi());
            for (int c = 0; c < parametriStimati.getRowDimension(); c++) {
                risultato.set(numeroIterazione, c, parametriStimati.get(c));
            }
            risultato.set(numeroIterazione, 6, source.getNumeroPuntiOmologhi());
            //OLD
            output = Mappa.creaCopia(source, "");
            Trasforma.conAffine(output, parametriStimati);
            risultato.set(numeroIterazione, 7, Stima.getVettoreScarti(output.getPuntiOmologhi(), target.getPuntiOmologhi()).stimaVarianza(6));



            if (transform) {
                if (tabellaRelazioneLivelli != null) {
                    Stima.FischerSemantico(source, target, output, angolo, sigma, distanzaMax, tabellaRelazioneLivelli);
                } else {
                    Stima.FischerGeometrico(source, target, output, angolo, sigma, distanzaMax);
                }
            }


            numeroIterazione++;
            if (source.getNumeroPuntiOmologhi() < 5) {
                ripeti = false;
            }
            if ((numeroIterazione > 1) && ((float) risultato.get(numeroIterazione - 1, 7) == (float) risultato.get(numeroIterazione - 2, 7))) {
                ripeti = false;
            }
        }
        Trasforma.conAffine(source, parametriStimati);
        return "e;f;a;b;c;d;punti;varianza\r\n" + risultato.stampa();
    }

    public Mappa leggiMappa(byte[] layer, byte[] omologhi) {
        Mappa map = Utility.leggi(layer);
        Utility.leggiOmologhi(omologhi, map);
        System.out.println("Numero entita: " + map.getNumeroEntita());
        System.out.println("Numero punti omologhi: " + map.getNumeroPuntiOmologhi());
        return map;
    }


    public void setSource(byte[] source, byte[] omologhi) {

        this.source = this.leggiMappa(source, omologhi);
    }

    public void setTarget(byte[] target, byte[] omologhi) {
        this.target = this.leggiMappa(target, omologhi);
    }

    public void setParams(double angolo, double sigma, double distanza, int iterazioni) {
        this.angolo = angolo;
        this.sigma = sigma;
        this.distanza = distanza;
        this.iterazioni = iterazioni;
    }

    public void setTabellaRelazioneLivelli(
            TabellaRelazioneLivelli tabellaRelazioneLivelli) {
        this.tabellaRelazioneLivelli = tabellaRelazioneLivelli;

    }

    public String getHomologus() throws IOException {

        Mappa source = this.source;
        Mappa target = this.target;

        System.out.println(new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa());

        int numeroIterazioni = this.iterazioni;
        double angolo = this.angolo * Math.PI / 180;
        double sigma = this.sigma;
        double distanzaMax = this.distanza;
        TabellaRelazioneLivelli tabellaRelazioneLivelli = this.tabellaRelazioneLivelli;

        String outputTrasfAffine = this.stimaAffine(source, target, numeroIterazioni, angolo, sigma, distanzaMax, tabellaRelazioneLivelli, true);
        System.out.println(outputTrasfAffine);


        byte[] resultPoints = source.omologhiBeforeTransformation;
        byte[] resultPoints1 = target.omologhiBeforeTransformation;


        ResultJSON response = new ResultJSON();
        String statistiche = new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa();
        System.out.println(statistiche);
        response.setStatistics(statistiche);

        String points = "";
        InputStream is = null;
        is = new ByteArrayInputStream(resultPoints);
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            points = sb.toString();
        } finally {
            br.close();
        }

        String points1 = "";
        is = null;
        is = new ByteArrayInputStream(resultPoints1);
        br = new BufferedReader(new InputStreamReader(is));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            points1 = sb.toString();
        } finally {
            br.close();
        }


        response.setPoints(points);
        response.setPoints1(points1);

        Gson gson = new Gson();

        String toSend = gson.toJson(response);

        return toSend;
    }

    public String getHomologusAndMap() throws IOException {

        Mappa source = this.source;
        Mappa target = this.target;

        System.out.println(new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa());

        int numeroIterazioni = this.iterazioni;
        double angolo = this.angolo * Math.PI / 180;
        double sigma = this.sigma;
        double distanzaMax = this.distanza;
        TabellaRelazioneLivelli tabellaRelazioneLivelli = this.tabellaRelazioneLivelli;

        String outputTrasfAffine = this.stimaAffine(source, target, numeroIterazioni, angolo, sigma, distanzaMax, tabellaRelazioneLivelli, true);
        System.out.println(outputTrasfAffine);

        byte[] resultMap = Utility.salva(source);
        byte[] resultPoints = source.omologhiBeforeTransformation;
        byte[] resultPoints1 = target.omologhiBeforeTransformation;


        ResultJSON response = new ResultJSON();
        String statistiche = new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa();
        System.out.println(statistiche);
        try {
            byte[] resultPoints = Utility.salvaOmologhi(source);
            source.omologhiBeforeTransformation = resultPoints;
            byte[] resultPoints1 = Utility.salvaOmologhi(target);
            target.omologhiBeforeTransformation = resultPoints1;
        } catch (IOException e) {
            e.printStackTrace();
        }
        response.setStatistics(statistiche);

        String points = "";
        InputStream is = null;
        is = new ByteArrayInputStream(resultPoints);
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            points = sb.toString();
        } finally {
            br.close();
        }

        String points1 = "";
        is = null;
        is = new ByteArrayInputStream(resultPoints1);
        br = new BufferedReader(new InputStreamReader(is));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            points1 = sb.toString();
        } finally {
            br.close();
        }


        String map = "";
        is = null;
        is = new ByteArrayInputStream(resultMap);
        br = new BufferedReader(new InputStreamReader(is));
        try {

            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            map = sb.toString();
        } finally {
            br.close();
        }


        response.setPoints(points);
        response.setPoints1(points1);
        response.setResultMap(map);

        Gson gson = new Gson();

        String toSend = gson.toJson(response);

        return toSend;
    }




    public String execute() throws IOException {

        Mappa source = this.source;
        Mappa target = this.target;
        int numeroIterazioni = this.iterazioni;
        double angolo = this.angolo * Math.PI / 180;
        double sigma = this.sigma;
        double distanzaMax = this.distanza;

        System.out.println(new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa());

        //TabellaRelazioneLivelli tabellaRelazioneLivelli=this.tabellaRelazioneLivelli;

        String outputTrasfAffine = this.stimaAffine(source, target, numeroIterazioni, angolo, sigma, distanzaMax, tabellaRelazioneLivelli, false);
        System.out.println(outputTrasfAffine);

        System.out.println(new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa());

        byte[] resultMap = Utility.salva(source);
        byte[] resultOmologhi = Utility.salvaOmologhi(target);

        //int filtraggio = 2;
        //String outputTrasfSpline = this.stimaSpline(source, target, filtraggio, numeroIterazioni);

        ResultJSON response = new ResultJSON();

        String statistiche = new Statistiche(source.getPuntiOmologhi(), target.getPuntiOmologhi()).stampa();
        response.setStatistics(statistiche);


        String map = "";
        InputStream is = null;
        is = new ByteArrayInputStream(resultMap);
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        try {

            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            map = sb.toString();
        } finally {
            br.close();
        }


        String points = "";
        is = null;
        is = new ByteArrayInputStream(resultOmologhi);
        br = new BufferedReader(new InputStreamReader(is));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            points = sb.toString();
        } finally {
            br.close();
        }


        response.setResultMap(map);
        response.setPoints(points);

        Gson gson = new Gson();
        String toSend = gson.toJson(response);

        return toSend;
    }


}