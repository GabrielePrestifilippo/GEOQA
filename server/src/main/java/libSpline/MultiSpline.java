package libSpline;

import java.util.ArrayList;
import libGeometry.*;
import libMath.Matrix;

public class MultiSpline {

    private final ArrayList<Punto3d> osservazioni;
    private final ArrayList<Spline> elencoSpline;
    private final ArrayList<DatiSpline> elencoDatiSpline;
    private final Rectangle2d estremi;
    private Matrix Yo;
    private Matrix A;
    private Matrix stimati;
    private final Matrix scarti;
    private int filtro = 2;

    public MultiSpline(ArrayList osservazioni, Rectangle2d estremi) {
        this.elencoSpline = new ArrayList();
        this.osservazioni = osservazioni;
        this.elencoDatiSpline = new ArrayList();
        this.scarti = new Matrix(this.osservazioni.size(), 1);
        this.estremi = estremi;
        Spline spline = new Spline(new Griglia(this.estremi, 3, 3), osservazioni);
        elencoSpline.add(spline);
        spline.calcolaNodi(this.filtro);
    }

    public Matrix getYo() {
        return Yo;
    }

    public void setYo(Matrix Yo) {
        this.Yo = Yo;
    }

    public Matrix getA() {
        return A;
    }

    public void setA(Matrix A) {
        this.A = A;
    }

    public Matrix getStimati() {
        return stimati;
    }

    public void setStimati(Matrix stimati) {
        this.stimati = stimati;
    }

    public void setFiltro(int numero) {
        this.filtro = numero;
        this.calcolaNodi();
    }

    public void aggiungiLivello() {
        Punto2i numNodi = elencoSpline.get(elencoSpline.size() - 1).getGriglia().getNumeroNodi();
        Spline spline = new Spline(new Griglia(this.estremi, (numNodi.getX() * 2) - 1, (numNodi.getY() * 2) - 1), this.osservazioni);
        spline.calcolaNodi(this.filtro);
        elencoSpline.add(spline);
    }

    public void eliminaLivello() {
        if (elencoSpline.size() > 0) {
            elencoSpline.remove(elencoSpline.size() - 1);
        }
    }

    private void calcolaNodi() {
        for (int c = 0; c < elencoSpline.size(); c++) {
            elencoSpline.get(c).calcolaNodi(this.filtro);
        }
    }

    private int getIndice(int x, int y, int grid) {
        int indice = -1;
        int c = 0;
        boolean trovato = false;
        while ((!trovato) && (c < this.elencoDatiSpline.size())) {
            DatiSpline datiSpline = elencoDatiSpline.get(c);
            if ((datiSpline.getX() == x) && (datiSpline.getY() == y) && (grid == datiSpline.getGrid())) {
                indice = c;
                trovato = true;
            }
            c++;
        }
        return indice;
    }

    public ArrayList<Punto3d> getOsservazioni() {
        return osservazioni;
    }

    public ArrayList<Spline> getElencoSpline() {
        return elencoSpline;
    }

    public ArrayList<DatiSpline> getElencoDatiSpline() {
        return elencoDatiSpline;
    }

    public int getFiltro() {
        return filtro;
    }

    private boolean inserito(int x, int y, Griglia griglia) {
        boolean inserito = false;
        double nX = (double) x / (griglia.getNumeroNodi().getX() - 1);
        double nY = (double) y / (griglia.getNumeroNodi().getY() - 1);
        int c = 0;
        while ((!inserito) && c < this.elencoDatiSpline.size()) {
            DatiSpline datiSpline = elencoDatiSpline.get(c);
            Spline spline = elencoSpline.get(datiSpline.getGrid());
            double nX2 = (double) datiSpline.getX() / (spline.getGriglia().getNumeroNodi().getX() - 1);
            double nY2 = (double) datiSpline.getY() / (spline.getGriglia().getNumeroNodi().getY() - 1);
            if ((nX2 == nX) && (nY2 == nY)) {
                inserito = true;
            }
            c++;
        }
        return inserito;
    }

    private void calcolaNodiTotali() {
        this.elencoDatiSpline.clear();
        for (int c = 0; c < elencoSpline.size(); c++) {
            Spline spline = elencoSpline.get(c);
            Griglia griglia = spline.getGriglia();
            for (int cX = 0; cX < griglia.getNumeroNodi().getX(); cX++) {
                for (int cY = 0; cY < griglia.getNumeroNodi().getY(); cY++) {
                    if (spline.isNodo(cX, cY) && !inserito(cX, cY, griglia)) {
                        elencoDatiSpline.add(new DatiSpline(cX, cY, c));
                    }
                }
            }
        }

    }

    public int calcolaMultiSpline() {
        this.calcolaNodiTotali();
        if (this.osservazioni.size() < this.elencoDatiSpline.size()) {
            return 2;
        }
        Yo = new Matrix(osservazioni.size(), 1);
        A = new Matrix(osservazioni.size(), elencoDatiSpline.size());
        for (int c1 = 0; c1 < osservazioni.size(); c1++) {
            Punto3d p = osservazioni.get(c1);
            Yo.set(c1, 0, p.getZ());
            for (int c2 = 0; c2 < elencoSpline.size(); c2++) {
                Griglia griglia = elencoSpline.get(c2).getGriglia();
                int iX = griglia.iX(p);
                int iY = griglia.iY(p);
                double xx = griglia.xx(p);
                double yy = griglia.yy(p);
                int indice = this.getIndice(iX, iY, c2);
                if (indice != -1) {
                    A.set(c1, indice, A.get(c1, indice) + (1 - xx - yy + xx * yy));
                }
                indice = this.getIndice(iX, iY + 1, c2);
                if (indice != -1) {
                    A.set(c1, indice, A.get(c1, indice) + (yy - xx * yy));
                }
                indice = this.getIndice(iX + 1, iY, c2);
                if (indice != -1) {
                    A.set(c1, indice, A.get(c1, indice) + (xx - xx * yy));
                }
                indice = this.getIndice(iX + 1, iY + 1, c2);
                if (indice != -1) {
                    A.set(c1, indice, A.get(c1, indice) + xx * yy);
                }
            }
        }
        try {
            this.stimati = A.solve(Yo);
            for (int c = 0; c < this.elencoDatiSpline.size(); c++) {
                this.elencoDatiSpline.get(c).setValore(this.stimati.get(c, 0));
            }
            return 0;
        } catch (RuntimeException exception) {
            System.out.println(exception.toString());
            return 1;
        }
    }

    protected double interpola(Punto3d punto) {
        int iX, iY;
        double xx, yy;
        double valore = 0;
        if (this.estremi.contienePunto(punto)) {
            for (int c = 0; c < elencoSpline.size(); c++) {
                Griglia griglia = elencoSpline.get(c).getGriglia();
                iX = griglia.iX(punto);
                iY = griglia.iY(punto);
                xx = griglia.xx(punto);
                yy = griglia.yy(punto);
                int indice = this.getIndice(iX, iY, c);
                if (indice != -1) {
                    valore = valore + (1 - xx - yy + xx * yy) * elencoDatiSpline.get(indice).getValore();
                }
                indice = this.getIndice(iX, iY + 1, c);
                if (indice != -1) {
                    valore = valore + (yy - xx * yy) * elencoDatiSpline.get(indice).getValore();
                }
                indice = this.getIndice(iX + 1, iY, c);
                if (indice != -1) {
                    valore = valore + (xx - xx * yy) * elencoDatiSpline.get(indice).getValore();
                }
                indice = this.getIndice(iX + 1, iY + 1, c);
                if (indice != -1) {
                    valore = valore + (xx * yy) * elencoDatiSpline.get(indice).getValore();
                }
            }
            return valore;
        } else {
            return 0;
        }
    }

    public Matrix getScarti() {
        return this.scarti;
    }

    public int getNumeroParametri() {
        return this.stimati.getRowDimension();
    }

    public void interpolaSuOsservazioni() {
        for (int c = 0; c < this.osservazioni.size(); c++) {
            Punto3d osservazione = this.osservazioni.get(c);
            scarti.set(c, 0, this.interpola(osservazione) - osservazione.getZ());
        }
    }

    public int getNumeroSpline() {
        return this.elencoDatiSpline.size();
    }

    public Rectangle2d getEstremi() {
        return this.estremi;
    }

}
