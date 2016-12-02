package libGeometry;

public class Punto2d {

    protected double x, y;

    public Punto2d(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Punto2d() {
        this.x = 0;
        this.y = 0;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

}
