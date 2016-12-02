package libSpline;

import java.util.ArrayList;
import java.util.Map;
import libMath.*;
import libGeometry.*;

public class Stima {

    public static Matrix calcolaParametri(ArrayList<Punto3d> omologhiSource, ArrayList<Punto3d> omologhiTarget) {
        Matrix parametriStimati = null;
        if (omologhiSource.size() == omologhiTarget.size()) {
            int num_Punti = omologhiSource.size();
            Matrix A = new Matrix(num_Punti * 2, 6);
            Matrix osservazioni = new Matrix(A.getRowDimension(), 1);
            for (int c = 0; c < num_Punti; c++) {
                osservazioni.set((c * 2), (omologhiTarget.get(c)).getX());
                osservazioni.set((c * 2) + 1, (omologhiTarget.get(c)).getY());
            }
            for (int c = 0; c < num_Punti; c++) {
                double[] v1 = {1, 0, (omologhiSource.get(c)).getX(), (omologhiSource.get(c)).getY(), 0, 0};
                double[] v2 = {0, 1, 0, 0, (omologhiSource.get(c)).getX(), (omologhiSource.get(c)).getY()};
                A.set(c * 2, v1);
                A.set((c * 2) + 1, v2);
            }
            parametriStimati = A.solve(osservazioni);
        }
        return parametriStimati;
    }

    public static Matrix getVettoreScarti(ArrayList<Punto3d> omologhiSource, ArrayList<Punto3d> omologhiTarget) {
        Matrix scarti = null;
        if (omologhiSource.size() == omologhiTarget.size()) {
            int num_Punti = omologhiSource.size();
            Matrix omologhiS = new Matrix(num_Punti * 2, 1);
            Matrix omologhiT = new Matrix(num_Punti * 2, 1);
            for (int c = 0; c < num_Punti; c++) {
                omologhiS.set(c * 2, (omologhiSource.get(c)).getX());
                omologhiS.set((c * 2) + 1, (omologhiSource.get(c)).getY());
                omologhiT.set(c * 2, (omologhiTarget.get(c)).getX());
                omologhiT.set((c * 2) + 1, (omologhiTarget.get(c)).getY());
            }
            scarti = omologhiT.minus(omologhiS);
        }
        return scarti;
    }

    public static void FischerGeometrico(Mappa source, Mappa target, Mappa output, double angolo, double sigma, double distanzaMax) {
        int n1 = 2;
        int n2 = source.getNumeroPuntiOmologhi() * 2 - 6;
        FisherDistribution fDis = new FisherDistribution(n1, n2);
        Domain dominio = fDis.getDomain();
        double min = dominio.getLowerBound();
        double max = dominio.getUpperBound();
        fDis.setParameters(min, max, 0.01, 1);
        double quantile = fDis.getQuantile(1 - 0.025);
        Matrix vettoreScarti = getVettoreScarti(target.getPuntiOmologhi(), output.getPuntiOmologhi());
        double varianza = vettoreScarti.stimaVarianza(6) + 0.00001;
        int num_Punti = source.getNumeroPuntiOmologhi();
        Matrix A = new Matrix(num_Punti * 2, 6);
        for (int c = 0; c < num_Punti; c++) {
            double[] v1 = {1, 0, source.getPuntoOmologo(c).getX(), source.getPuntoOmologo(c).getY(), 0, 0};
            double[] v2 = {0, 1, 0, 0, source.getPuntoOmologo(c).getX(), source.getPuntoOmologo(c).getY()};
            A.set(c * 2, v1);
            A.set((c * 2) + 1, v2);
        }
        Matrix N = A.transpose().times(A);
        Matrix InvN = N.inverse();
        source.resettaPuntiOmologhi();
        target.resettaPuntiOmologhi();
        output.resettaPuntiOmologhi();
        Matrix scarto = new Matrix(2, 1);
        Matrix T = new Matrix(2, 6);
        Matrix K;
        double Fisher;
        Punto3d omologo;
        Punto3d vertice1;
        Punto3d vertice3;
        Rectangle2d intorno = new Rectangle2d();
        double distanzaPunti;
        if (angolo != 2 * Math.PI) {
            target.calcolaAngoliLivello("ALL");
            output.calcolaAngoliLivello("ALL");
        }
        for (int c1 = 0; c1 < source.getNumeroVertici(); c1++) {
            vertice1 = source.getVertice(c1);
            vertice3 = output.getVertice(c1);
            double[] v1 = {1, 0, vertice1.getX(), vertice1.getY(), 0, 0};
            double[] v2 = {0, 1, 0, 0, vertice1.getX(), vertice1.getY()};
            T.set(0, v1);
            T.set(1, v2);
            intorno.setxLowLeft(vertice3.getX() - sigma * Math.sqrt(varianza));
            intorno.setyLowLeft(vertice3.getY() - sigma * Math.sqrt(varianza));
            intorno.setxUpRight(vertice3.getX() + sigma * Math.sqrt(varianza));
            intorno.setyUpRight(vertice3.getY() + sigma * Math.sqrt(varianza));
            K = T.times(InvN.times(T.transpose()));
            K.set(0, 0, 1 + K.get(0, 0));
            K.set(1, 1, 1 + K.get(1, 1));
            Matrix InvK = K.inverse();
            double F = Double.POSITIVE_INFINITY;
            omologo = null;
            Rectangle2i estremiQuad = target.getQuadTreeVertici().getEstremiQuadri(intorno);
            for (int cX = estremiQuad.getxLowLeft(); cX <= estremiQuad.getxUpRight(); cX++) {
                for (int cY = estremiQuad.getyLowLeft(); cY <= estremiQuad.getyUpRight(); cY++) {
                    ArrayList<Punto3d> quadrato = target.getQuadTreeVertici().getCella(cX, cY);
                    if (quadrato != null) {
                        for (int c2 = 0; c2 < quadrato.size(); c2++) {
                            Punto3d vertice2 = quadrato.get(c2);
                            if (intorno.contienePunto(vertice2)) {
                                distanzaPunti = vertice2.distanzaDa(vertice3);
                                if (distanzaPunti < distanzaMax) {
                                    if ((angolo == 2 * Math.PI) || (vertice3.stessoAngolo(vertice2, angolo))) {
                                        scarto.set(0, vertice2.getX() - vertice3.getX());
                                        scarto.set(1, vertice2.getY() - vertice3.getY());
                                        Fisher = scarto.transpose().times(InvK.times(scarto)).get(0) / (2 * varianza);
                                        if (Fisher < F) {
                                            F = Fisher;
                                            omologo = vertice2;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (omologo != null) {
                if (F < quantile) {
                    Punto3d esistenteInTav2 = target.getOmologo(omologo);
                    if (esistenteInTav2 != null) {
                        if (F < esistenteInTav2.getPeso()) {
                            int indiceOmologo = target.getIndicePuntoOmologo(esistenteInTav2);
                            Punto3d esistenteInTav1 = source.getPuntoOmologo(indiceOmologo);
                            Punto3d esistenteInTav3 = output.getPuntoOmologo(indiceOmologo);
                            source.rimuoviPuntoOmologo(esistenteInTav1);
                            target.rimuoviPuntoOmologo(esistenteInTav2);
                            output.rimuoviPuntoOmologo(esistenteInTav3);
                            omologo.setPeso(F);
                            source.setOmologo(vertice1);
                            target.setOmologo(omologo);
                            output.setOmologo(vertice3);
                        }
                    } else {
                        omologo.setPeso(F);
                        source.setOmologo(vertice1);
                        target.setOmologo(omologo);
                        output.setOmologo(vertice3);
                    }
                }
            }
        }
    }

    public static void FischerSemantico(Mappa source, Mappa target, Mappa output, double angolo, double sigma, double distanzaMax, TabellaRelazioneLivelli tabLevel) {
        int n1 = 2;
        int n2 = source.getNumeroPuntiOmologhi() * 2 - 6;
        FisherDistribution fDis = new FisherDistribution(n1, n2);
        Domain dominio = fDis.getDomain();
        double min = dominio.getLowerBound();
        double max = dominio.getUpperBound();
        fDis.setParameters(min, max, 0.01, 1);
        double quantile = fDis.getQuantile(1 - 0.025);
        Matrix vettoreScarti = getVettoreScarti(target.getPuntiOmologhi(), output.getPuntiOmologhi());
        double varianza = vettoreScarti.stimaVarianza(6) + 0.00001;
        int num_Punti = source.getNumeroPuntiOmologhi();
        Matrix A = new Matrix(num_Punti * 2, 6);
        for (int c = 0; c < num_Punti; c++) {
            double[] v1 = {1, 0, source.getPuntoOmologo(c).getX(), source.getPuntoOmologo(c).getY(), 0, 0};
            double[] v2 = {0, 1, 0, 0, source.getPuntoOmologo(c).getX(), source.getPuntoOmologo(c).getY()};
            A.set(c * 2, v1);
            A.set((c * 2) + 1, v2);
        }
        Matrix N = A.transpose().times(A);
        Matrix InvN = N.inverse();
        source.resettaPuntiOmologhi();
        target.resettaPuntiOmologhi();
        output.resettaPuntiOmologhi();
        Map<String, QuadTree> elencoQuadLivelloTav1 = source.getQuadTreeLivelli();
        Map<String, QuadTree> elencoQuadLivelloTav2 = target.getQuadTreeLivelli();
        Matrix scarto = new Matrix(2, 1);
        Matrix T = new Matrix(2, 6);
        Matrix K;
        double Fisher;
        Punto3d omologo;
        Punto3d vertice1;
        int indiceVerticeTav1;
        Punto3d vertice3;
        Rectangle2d intorno = new Rectangle2d();
        double distanzaPunti;
        QuadTree quadTav1;
        QuadTree quadTav2;
        for (String key : elencoQuadLivelloTav1.keySet()) {
            String livelloTav1 = key;
            quadTav1 = elencoQuadLivelloTav1.get(livelloTav1);
            ArrayList<String> elencoLivelloTav2Associati = tabLevel.getElencoLivelli(true, livelloTav1);
            if (elencoLivelloTav2Associati != null) {
                if (angolo != 2 * Math.PI) {
                    output.calcolaAngoliLivello(livelloTav1);
                }
                for (int c1 = 0; c1 < elencoLivelloTav2Associati.size(); c1++) {
                    String livelloTav2 = elencoLivelloTav2Associati.get(c1);
                    quadTav2 = elencoQuadLivelloTav2.get(livelloTav2);
                    if (angolo != 2 * Math.PI) {
                        target.calcolaAngoliLivello(livelloTav2);
                    }
                    for (int cX1 = 0; cX1 < quadTav1.getNumeroCelle().getX(); cX1++) {
                        for (int cY1 = 0; cY1 < quadTav1.getNumeroCelle().getY(); cY1++) {
                            if (quadTav1.getCella(cX1, cY1) != null) {
                                ArrayList<Punto3d> elencoVertici = quadTav1.getCella(cX1, cY1);
                                for (int c2 = 0; c2 < elencoVertici.size(); c2++) {
                                    vertice1 = elencoVertici.get(c2);
                                    indiceVerticeTav1 = source.getIndiceVertice(vertice1);
                                    double[] v1 = {1, 0, vertice1.getX(), vertice1.getY(), 0, 0};
                                    double[] v2 = {0, 1, 0, 0, vertice1.getX(), vertice1.getY()};
                                    T.set(0, v1);
                                    T.set(1, v2);
                                    vertice3 = output.getVertice(indiceVerticeTav1);
                                    intorno.setxLowLeft(vertice3.getX() - sigma * Math.sqrt(varianza));
                                    intorno.setyLowLeft(vertice3.getY() - sigma * Math.sqrt(varianza));
                                    intorno.setxUpRight(vertice3.getX() + sigma * Math.sqrt(varianza));
                                    intorno.setyUpRight(vertice3.getY() + sigma * Math.sqrt(varianza));
                                    K = T.times(InvN.times(T.transpose()));
                                    K.set(0, 0, 1 + K.get(0, 0));
                                    K.set(1, 1, 1 + K.get(1, 1));
                                    Matrix InvK = K.inverse();
                                    double F = Double.POSITIVE_INFINITY;
                                    omologo = null;
                                    Rectangle2i estremiQuad = quadTav2.getEstremiQuadri(intorno);
                                    for (int cX2 = estremiQuad.getxLowLeft(); cX2 <= estremiQuad.getxUpRight(); cX2++) {
                                        for (int cY2 = estremiQuad.getyLowLeft(); cY2 <= estremiQuad.getyUpRight(); cY2++) {
                                            if (quadTav2.getCella(cX2, cY2) != null) {
                                                for (int c3 = 0; c3 < quadTav2.getCella(cX2, cY2).size(); c3++) {
                                                    Punto3d vertice2 = quadTav2.getCella(cX2, cY2).get(c3);
                                                    if (intorno.contienePunto(vertice2)) {
                                                        distanzaPunti = vertice2.distanzaDa(vertice3);
                                                        if (distanzaPunti < distanzaMax) {
                                                            if ((angolo == 2 * Math.PI) || (vertice3.stessoAngolo(vertice2, angolo))) {
                                                                scarto.set(0, vertice2.getX() - vertice3.getX());
                                                                scarto.set(1, vertice2.getY() - vertice3.getY());
                                                                Fisher = scarto.transpose().times(InvK.times(scarto)).get(0) / (2 * varianza);
                                                                if (Fisher < F) {
                                                                    F = Fisher;
                                                                    omologo = vertice2;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (omologo != null) {
                                        if (F < quantile) {
                                            Punto3d esistenteInTav1 = source.getOmologo(vertice1);
                                            Punto3d esistenteInTav2 = target.getOmologo(omologo);
                                            Punto3d esistenteInTav3 = null;
                                            int indiceOmologo;
                                            if (esistenteInTav2 != null || esistenteInTav1 != null) {
                                                double fisherGiaInserito = 0;
                                                if ((esistenteInTav1 != null) && (esistenteInTav2 != null)) {
                                                    fisherGiaInserito = (esistenteInTav1.getPeso() + esistenteInTav2.getPeso()) / 2;
                                                    if (F < fisherGiaInserito) {
                                                        indiceOmologo = source.getIndicePuntoOmologo(esistenteInTav1);
                                                        Punto3d daRimuovereInTav2 = target.getPuntoOmologo(indiceOmologo);
                                                        Punto3d daRimuovereInTav3 = output.getPuntoOmologo(indiceOmologo);
                                                        source.rimuoviPuntoOmologo(esistenteInTav1);
                                                        target.rimuoviPuntoOmologo(daRimuovereInTav2);
                                                        output.rimuoviPuntoOmologo(daRimuovereInTav3);
                                                        indiceOmologo = target.getIndicePuntoOmologo(esistenteInTav2);
                                                        Punto3d daRimuovereInTav1 = source.getPuntoOmologo(indiceOmologo);
                                                        daRimuovereInTav3 = output.getPuntoOmologo(indiceOmologo);
                                                        source.rimuoviPuntoOmologo(daRimuovereInTav1);
                                                        target.rimuoviPuntoOmologo(esistenteInTav2);
                                                        output.rimuoviPuntoOmologo(daRimuovereInTav3);
                                                        omologo.setPeso(F);
                                                        vertice1.setPeso(F);
                                                        vertice1.setLivello(livelloTav1);
                                                        omologo.setLivello(livelloTav2);
                                                        vertice3.setLivello(livelloTav1);
                                                        source.setOmologo(vertice1);
                                                        target.setOmologo(omologo);
                                                        output.setOmologo(vertice3);
                                                    }
                                                } else {
                                                    if (esistenteInTav2 != null) {
                                                        fisherGiaInserito = esistenteInTav2.getPeso();
                                                        indiceOmologo = target.getIndicePuntoOmologo(esistenteInTav2);
                                                        esistenteInTav1 = source.getPuntoOmologo(indiceOmologo);
                                                        esistenteInTav3 = output.getPuntoOmologo(indiceOmologo);
                                                    } else if (esistenteInTav1 != null) {
                                                        fisherGiaInserito = esistenteInTav1.getPeso();
                                                        indiceOmologo = source.getIndicePuntoOmologo(esistenteInTav1);
                                                        esistenteInTav2 = target.getPuntoOmologo(indiceOmologo);
                                                        esistenteInTav3 = output.getPuntoOmologo(indiceOmologo);
                                                    }
                                                    if (F < fisherGiaInserito) {
                                                        source.rimuoviPuntoOmologo(esistenteInTav1);
                                                        target.rimuoviPuntoOmologo(esistenteInTav2);
                                                        output.rimuoviPuntoOmologo(esistenteInTav3);
                                                        omologo.setPeso(F);
                                                        vertice1.setPeso(F);
                                                        vertice1.setLivello(livelloTav1);
                                                        omologo.setLivello(livelloTav2);
                                                        vertice3.setLivello(livelloTav1);
                                                        source.setOmologo(vertice1);
                                                        target.setOmologo(omologo);
                                                        output.setOmologo(vertice3);
                                                    }
                                                }
                                            } else {
                                                omologo.setPeso(F);
                                                vertice1.setPeso(F);
                                                vertice1.setLivello(livelloTav1);
                                                omologo.setLivello(livelloTav2);
                                                vertice3.setLivello(livelloTav1);
                                                source.setOmologo(vertice1);
                                                target.setOmologo(omologo);
                                                output.setOmologo(vertice3);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
