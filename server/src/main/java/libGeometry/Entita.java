package libGeometry;

import java.util.ArrayList;

public class Entita {

    private final ArrayList<Punto3d> vertici;
    private final Rectangle2d boundingBox;
    private final Mappa mappa;
    private String codice;

    public Entita(Mappa mappa) {
        this.mappa = mappa;
        vertici = new ArrayList();
        boundingBox = new Rectangle2d(Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY);
    }

    protected void calcolaBoundingBox() {
        boundingBox.resetta();
        for (int c = 0; c < this.vertici.size(); c++) {
            Punto3d punto = vertici.get(c);
            if (punto.x <= boundingBox.xLowLeft) {
                boundingBox.xLowLeft = punto.x;
            }
            if (punto.x >= boundingBox.xUpRight) {
                boundingBox.xUpRight = punto.x;
            }
            if (punto.y <= boundingBox.yLowLeft) {
                boundingBox.yLowLeft = punto.y;
            }
            if (punto.y >= boundingBox.yUpRight) {
                boundingBox.yUpRight = punto.y;
            }
        }
    }

    protected Punto3d getVertice(int indice) {
        return this.vertici.get(indice);
    }

    protected int getNumeroVertici() {
        return this.vertici.size();
    }

    public ArrayList<Punto3d> getVertici() {
        return vertici;
    }

    public Mappa getMappa() {
        return mappa;
    }

    protected void addVertice(Punto3d punto) {
        Punto3d p = this.mappa.getVertice(punto);
        if (p == null) {
            this.mappa.inserisciVertice(punto);
            this.vertici.add(punto);
        } else {
            this.vertici.add(p);
        }
    }

    protected void rimuoviVertice(int indice) {
        this.vertici.remove(indice);
    }

    protected void setCodice(String codice) {
        this.codice = codice;
    }

    protected String getCodice() {
        return this.codice;
    }

    protected Rectangle2d getBoundingBox() {
        return this.boundingBox;
    }

    protected boolean isChiusa() {
        return (this.vertici.get(0) == this.vertici.get(vertici.size() - 1)) && (this.vertici.size() > 2);
    }

    private double arcTng(Punto3d P0, Punto3d P1) {
        double angolo;
        double num = P1.y - P0.y;
        double den = P1.x - P0.x;
        if (den == 0) {
            if (num > 0) {
                angolo = Math.PI / 2;
            } else {
                angolo = 3 * Math.PI / 2;
            }
        } else if (num == 0) {
            if (den > 0) {
                angolo = 0;
            } else {
                angolo = Math.PI;
            }
        } else if ((den < 0)) {
            angolo = Math.PI + Math.atan(num / den);
        } else if ((num < 0) && (den > 0)) {
            angolo = 2 * Math.PI + Math.atan(num / den);
        } else {
            angolo = Math.atan(num / den);
        }
        return angolo;
    }

    protected void calcolaAngoli() {
        Punto3d p0;
        Punto3d p1;
        Punto3d p2;
        if (this.getNumeroVertici() == 1) {
        } else if (this.isChiusa()) {
            p0 = this.getVertice(0);
            p1 = this.getVertice(this.getNumeroVertici() - 2);
            p2 = this.getVertice(1);
            p0.aggiungiAngolo(arcTng(p0, p1));
            p0.aggiungiAngolo(arcTng(p0, p2));
            for (int c = 1; c < this.getNumeroVertici() - 1; c++) {
                p0 = this.getVertice(c);
                p1 = this.getVertice(c - 1);
                p2 = this.getVertice(c + 1);
                p0.aggiungiAngolo(arcTng(p0, p1));
                p0.aggiungiAngolo(arcTng(p0, p2));
            }
        } else {
            p0 = this.getVertice(0);
            p2 = this.getVertice(1);
            p0.aggiungiAngolo(arcTng(p0, p2));
            p0 = this.getVertice(this.getNumeroVertici() - 1);
            p1 = this.getVertice(this.getNumeroVertici() - 2);
            p0.aggiungiAngolo(arcTng(p0, p1));
            if (this.getNumeroVertici() > 2) {
                for (int c = 1; c < this.getNumeroVertici() - 1; c++) {
                    p0 = this.getVertice(c);
                    p1 = this.getVertice(c - 1);
                    p2 = this.getVertice(c + 1);
                    p0.aggiungiAngolo(arcTng(p0, p1));
                    p0.aggiungiAngolo(arcTng(p0, p2));
                }
            }
        }
    }
}
