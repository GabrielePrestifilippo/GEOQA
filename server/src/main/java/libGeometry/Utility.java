package libGeometry;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.*;
import java.util.*;

public class Utility {

   // public static Mappa leggi(String fileName) {
	public static Mappa leggi(byte[] layer) {
        BufferedReader bufferedReader;
        String linea;
        StringTokenizer st;
        String token;
        int num_Token;
        Mappa mappa = new Mappa();
        Entita entita = null;
    	
    	InputStream is = null;
        try {
        	 is = new ByteArrayInputStream(layer);
        	bufferedReader = new BufferedReader(new InputStreamReader(is));
            try {
                while ((linea = bufferedReader.readLine()) != null) {
                    try {
                        st = new StringTokenizer(linea, " ", false);
                        num_Token = st.countTokens();
                        if (num_Token == 4) {
                            Rectangle2d estremi = new Rectangle2d();
                            estremi.xLowLeft = Double.valueOf(st.nextToken());
                            estremi.yLowLeft = Double.valueOf(st.nextToken());
                            estremi.xUpRight = Double.valueOf(st.nextToken());
                            estremi.yUpRight = Double.valueOf(st.nextToken());
                            mappa.setEstremi(estremi);
                            System.out.println("Estremi: ");
                            System.out.println(estremi.xLowLeft);
                            System.out.println(estremi.yLowLeft);
                            System.out.println(estremi.xUpRight);
                            System.out.println(estremi.yUpRight);
                        } else if ((num_Token == 2) || (num_Token == 3)) {
                            token = st.nextToken();
                            if (token.startsWith("P") || token.startsWith("L") || token.startsWith("A") || token.startsWith("S")) {
                                String livello = st.nextToken();
                                entita = new Entita(mappa);
                                entita.setCodice(livello);
                                mappa.addEntita(entita);
                                mappa.aggiungiLivello(livello);
                            } else {
                                double xd = Double.valueOf(token);
                                double yd = Double.valueOf(st.nextToken());
                                Punto3d punto = new Punto3d(xd, yd, 0);
                                if (entita != null) {
                                    entita.addVertice(punto);
                                }
                            }
                        }
                    } catch (NoSuchElementException noSuchElementException) {
                        System.out.println(noSuchElementException.toString());
                    }
                }
            } catch (java.io.IOException ioerror) {
                System.out.println(ioerror.toString());
            } finally {
                bufferedReader.close();
            }
        } catch (FileNotFoundException fileNotFoundException) {
            System.out.println(fileNotFoundException.toString());
        } catch (IOException iOException) {
            System.out.println(iOException.toString());
        }
        mappa.calcolaEstremi();
        mappa.setEntitaPerLivelli();
        return mappa;
    }

    //public static boolean leggiOmologhi(String fileName, Mappa mappa) {
       public static boolean leggiOmologhi(byte[] omologhi, Mappa mappa) {
        BufferedReader bufferedReader;
        StringTokenizer st;
        String linea;
        boolean letturaCorretta = true;
        boolean inserito = true;
        InputStream is = null;
        try {
        	 is = new ByteArrayInputStream(omologhi);
        	bufferedReader = new BufferedReader(new InputStreamReader(is));
            try {
                while (((linea = bufferedReader.readLine()) != null) && inserito) {
                    st = new StringTokenizer(linea, " ", false);
                    int Num_Token = st.countTokens();
                    if (Num_Token == 2) {
                        double x = Double.valueOf(st.nextToken());
                        double y = Double.valueOf(st.nextToken());
                        Punto3d punto = new Punto3d(x, y);
                        inserito = mappa.setOmologo(punto);
                    }
                }
            } catch (java.io.IOException iOException) {
                System.out.println(iOException.toString());
                letturaCorretta = false;
            } finally {
                bufferedReader.close();
            }
        } catch (FileNotFoundException fileNotFoundException) {
            System.out.println(fileNotFoundException.toString());
            letturaCorretta = false;
        } catch (IOException iOException) {
            System.out.println(iOException.toString());
            letturaCorretta = false;
        }
        return letturaCorretta;
    }


       
   // public static boolean salva(String fileName, Mappa mappa) throws IOException {
       public static byte[] salva(Mappa mappa) throws IOException {
        DecimalFormat decimalFormat = new DecimalFormat();
        decimalFormat.setGroupingUsed(false);
        DecimalFormatSymbols sy = new DecimalFormatSymbols();
        sy.setDecimalSeparator('.');
        decimalFormat.setDecimalFormatSymbols(sy);
        decimalFormat.setMaximumFractionDigits(3);
        decimalFormat.setMinimumFractionDigits(3);
        
        
        File temp = File.createTempFile("tempfile", ".tmp");
        String pathTemp = temp.getAbsolutePath();
        
        boolean scritturaCorretta = true;
        if (mappa.getNumeroEntita() != 0) {
            BufferedWriter bufferedWriter;
            String riga;
            String tipo;
            try {
                bufferedWriter = new BufferedWriter(new FileWriter(temp));
                
                try {
                    riga = decimalFormat.format(mappa.getBoundingBox().xLowLeft) + " "
                            + decimalFormat.format(mappa.getBoundingBox().yLowLeft) + " "
                            + decimalFormat.format(mappa.getBoundingBox().xUpRight) + " "
                            + decimalFormat.format(mappa.getBoundingBox().yUpRight) + "\r\n";
                    bufferedWriter.write(riga);
                    for (int c1 = 0; c1 < mappa.getNumeroEntita(); c1++) {
                        Entita entita = mappa.getEntita(c1);
                        int numVertici = entita.getNumeroVertici();
                        if (numVertici == 1) {
                            tipo = "P";
                        } else if (entita.isChiusa()) {
                            tipo = "A";
                        } else {
                            tipo = "L";
                        }
                        riga = tipo + " " + entita.getCodice() + "\r\n";
                        for (int c2 = 0; c2 < numVertici; c2++) {
                            Punto3d vertice = entita.getVertice(c2);
                            riga = riga + decimalFormat.format(vertice.x) + " " + decimalFormat.format(vertice.y) + "\r\n";
                        }
                        bufferedWriter.write(riga);
                    }
                } catch (java.io.IOException iOException) {
                    scritturaCorretta = false;
                    System.out.println(iOException.toString());

                } finally {
                    bufferedWriter.close();
                }
            } catch (FileNotFoundException fileNotFoundException) {
                System.out.println(fileNotFoundException.toString());
                scritturaCorretta = false;
            } catch (IOException iOException) {
                System.out.println(iOException.toString());
                scritturaCorretta = false;
            }
        }
        Path path = Paths.get(pathTemp);
        return Files.readAllBytes(path);
    }

   // public static boolean salvaOmologhi(String fileName, Mappa mappa) {
       public static byte[] salvaOmologhi(Mappa mappa) throws IOException {
       BufferedWriter bufferedWriter;
       
       File temp = File.createTempFile("tempfile", ".tmp");
       String pathTemp = temp.getAbsolutePath();
       
        boolean scritturaCorretta = true;
        try {
            bufferedWriter = new BufferedWriter(new FileWriter(temp));

            try {
                String riga;
                for (int c = 0; c < mappa.getNumeroPuntiOmologhi(); c++) {
                    Punto3d punto = mappa.getPuntoOmologo(c);
                    riga = punto.x + " " + punto.y + "\r\n";
                    bufferedWriter.write(riga);
                }
            } catch (java.io.IOException iOException) {
                System.out.println(iOException.toString());
                scritturaCorretta = false;
            } finally {
                bufferedWriter.close();
            }
        } catch (FileNotFoundException fileNotFoundException) {
            System.out.println(fileNotFoundException.toString());
            scritturaCorretta = false;
        } catch (IOException iOException) {
            System.out.println(iOException.toString());
            scritturaCorretta = false;
        }
        Path path = Paths.get(pathTemp);
        return Files.readAllBytes(path);
    }
}