package libGeometry;

public class Griglia {

    private Rectangle2d estremi;
    private final Punto2d delta;
    private final Punto2i numeroNodi;

    public Griglia(Rectangle2d bound, int x, int y) {
        this.numeroNodi = new Punto2i(x, y);
        this.estremi = bound;
        this.delta = new Punto2d();
        this.delta.x = estremi.larghezza() / (x - 1);
        this.delta.y = estremi.altezza() / (y - 1);
    }

    public void setEstremi(Rectangle2d estremi) {
        this.estremi = estremi;
        this.delta.x = estremi.larghezza() / (this.numeroNodi.x - 1);
        this.delta.y = estremi.altezza() / (this.numeroNodi.y - 1);
    }

    public Rectangle2d getEstremi() {
        return this.estremi;
    }

    public Punto2d getPasso() {
        return this.delta;
    }

    public Punto2i getNumeroNodi() {
        return this.numeroNodi;
    }

    public int iX(Punto3d dato) {
        return (int) ((dato.x - this.estremi.xLowLeft) / this.delta.x);
    }

    public int iY(Punto3d dato) {
        return (int) ((dato.y - this.estremi.yLowLeft) / this.delta.y);
    }

    public double xx(Punto3d dato) {
        return ((dato.x - this.estremi.xLowLeft) / this.delta.x) - iX(dato);
    }

    public double yy(Punto3d dato) {
        return ((dato.y - this.estremi.yLowLeft) / this.delta.y) - iY(dato);
    }

    public int getNumeroTotaleNodi() {
        return this.numeroNodi.x * this.numeroNodi.y;
    }

    public Punto2d getDelta() {
        return delta;
    }

}
