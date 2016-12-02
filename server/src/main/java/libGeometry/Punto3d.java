package libGeometry;

import java.util.ArrayList;

public class Punto3d extends Punto2d {

    private double z, peso;
    private ArrayList<Double> angoli;
    private String livello;

    public Punto3d() {
        super();
        this.z = 0;
        this.peso = Double.MAX_VALUE;
        this.angoli = new ArrayList();
    }

    public Punto3d(double x, double y) {
        super(x, y);
        this.z = 0;
        this.peso = Double.MAX_VALUE;
        this.angoli = new ArrayList();
    }

    public Punto3d(double x, double y, double z) {
        super(x, y);
        this.z = z;
        this.peso = Double.MAX_VALUE;
        this.angoli = new ArrayList();
    }

    public Punto3d deltaX(Punto3d punto) {
        return new Punto3d(this.x, this.y, punto.x - this.x);
    }

    public Punto3d deltaY(Punto3d punto) {
        return new Punto3d(this.x, this.y, punto.y - this.y);
    }

    public boolean equals(Punto3d punto) {
        return this.x == punto.x && this.y == punto.y && this.z == punto.z;
    }

    public void aggiungiAngolo(double angolo) {
        this.angoli.add(angolo);
    }

    public void annullaAngoli() {
        this.angoli = new ArrayList();
    }

    public void setLivello(String livello) {
        this.livello = livello;
    }

    public String getLivello() {
        return this.livello;
    }

    public boolean stessoAngolo(Punto3d punto, double angolo) {
        boolean stessoAngolo = true;
        ArrayList<Double> angoli1;
        ArrayList<Double> angoli2;
        if (this.angoli.size() < punto.angoli.size()) {
            angoli1 = this.angoli;
            angoli2 = punto.angoli;
        } else {
            angoli1 = punto.angoli;
            angoli2 = this.angoli;
        }
        for (int c1 = 0; c1 < angoli1.size(); c1++) {
            double angolo1 = angoli1.get(c1);
            boolean trovato = false;
            for (int c2 = 0; c2 < angoli2.size(); c2++) {
                double angolo2 = angoli2.get(c2);
                if (this.variazione(angolo1, angolo2) < angolo) {
                    trovato = true;
                }
            }
            if (!trovato) {
                stessoAngolo = false;
            }
        }
        return stessoAngolo;
    }

    private double variazione(double angolo1, double angolo2) {
        if (Math.abs(angolo1 - angolo2) < Math.PI) {
            return (Math.abs(angolo1 - angolo2));
        } else {
            return (2 * Math.PI) - (Math.abs(angolo1 - angolo2));
        }
    }

    public double getZ() {
        return z;
    }

    public void setZ(double z) {
        this.z = z;
    }

    public double getPeso() {
        return peso;
    }

    public void setPeso(double peso) {
        this.peso = peso;
    }

    public ArrayList<Double> getAngoli() {
        return angoli;
    }

    public void setAngoli(ArrayList<Double> angoli) {
        this.angoli = angoli;
    }

    public double distanzaDa(Punto3d punto) {
        return Math.sqrt(Math.pow((this.x - punto.x), 2) + Math.pow((this.y - punto.y), 2));
    }

}
