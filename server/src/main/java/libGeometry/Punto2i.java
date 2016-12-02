package libGeometry;

public class Punto2i {

    protected int x, y;

    public Punto2i(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public Punto2i() {
        this.x = 0;
        this.y = 0;
    }

    public void setValore(Punto2i punto) {
        this.x = punto.x;
        this.y = punto.y;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

}
