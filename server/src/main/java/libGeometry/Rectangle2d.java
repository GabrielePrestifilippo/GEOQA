package libGeometry;

public class Rectangle2d {

    protected double xLowLeft, yLowLeft, xUpRight, yUpRight;

    public Rectangle2d() {
        this.xLowLeft = 0;
        this.yLowLeft = 0;
        this.xUpRight = 0;
        this.yUpRight = 0;
    }

    public Rectangle2d(double XLowLeft, double YLowLeft, double XUpRight, double YUpRight) {
        this.xLowLeft = XLowLeft;
        this.yLowLeft = YLowLeft;
        this.xUpRight = XUpRight;
        this.yUpRight = YUpRight;
    }

    public Rectangle2d(Rectangle2d rettangolo) {
        this.xLowLeft = rettangolo.xLowLeft;
        this.yLowLeft = rettangolo.yLowLeft;
        this.xUpRight = rettangolo.xUpRight;
        this.yUpRight = rettangolo.yUpRight;
    }

    public void resetta() {
        this.xLowLeft = Double.POSITIVE_INFINITY;
        this.yLowLeft = Double.POSITIVE_INFINITY;
        this.xUpRight = Double.NEGATIVE_INFINITY;
        this.yUpRight = Double.NEGATIVE_INFINITY;
    }

    public double larghezza() {
        return (this.xUpRight - this.xLowLeft);
    }

    public double altezza() {
        return (this.yUpRight - this.yLowLeft);
    }

    public boolean contienePunto(Punto2d Punto) {
        return Punto.x <= this.xUpRight
                && Punto.x >= this.xLowLeft
                && Punto.y <= this.yUpRight
                && Punto.y >= this.yLowLeft;
    }

    public void setLowLeft(Punto2d punto) {
        this.xLowLeft = punto.x;
        this.yLowLeft = punto.y;
    }

    public void setUpPoint(Punto2d punto) {
        this.xUpRight = punto.x;
        this.yUpRight = punto.y;
    }

    public Punto2d getLowLeft() {
        return new Punto2d(this.xLowLeft, this.yLowLeft);
    }

    public Punto2d getUpRight() {
        return new Punto2d(this.xUpRight, this.yUpRight);
    }

    public Punto2d getLowRight() {
        return new Punto2d(this.xUpRight, this.yLowLeft);
    }

    public Punto2d getUpLeft() {
        return new Punto2d(this.xLowLeft, this.yUpRight);
    }

    public double getxLowLeft() {
        return xLowLeft;
    }

    public void setxLowLeft(double xLowLeft) {
        this.xLowLeft = xLowLeft;
    }

    public double getyLowLeft() {
        return yLowLeft;
    }

    public void setyLowLeft(double yLowLeft) {
        this.yLowLeft = yLowLeft;
    }

    public double getxUpRight() {
        return xUpRight;
    }

    public void setxUpRight(double xUpRight) {
        this.xUpRight = xUpRight;
    }

    public double getyUpRight() {
        return yUpRight;
    }

    public void setyUpRight(double yUpRight) {
        this.yUpRight = yUpRight;
    }

    public void squadra() {
        this.xUpRight = this.xLowLeft + Math.max(this.larghezza(), this.altezza());
        this.yUpRight = this.yLowLeft + Math.max(this.larghezza(), this.altezza());
    }

    public void maggiora(double percentuale) {
        double larghezza = this.larghezza();
        double altezza = this.altezza();
        xLowLeft = xLowLeft - percentuale * larghezza / 100;
        yLowLeft = yLowLeft - percentuale * altezza / 100;
        xUpRight = xUpRight + percentuale * larghezza / 100;
        yUpRight = yUpRight + percentuale * altezza / 100;
    }

    public Rectangle2d origine(double fattore) {
        Rectangle2d rettangolo = new Rectangle2d();
        double x = this.larghezza() / (1 + 2 * fattore / 100) * fattore / 100;
        double y = this.altezza() / (1 + 2 * fattore / 100) * fattore / 100;
        rettangolo.xLowLeft = this.xLowLeft + x;
        rettangolo.yLowLeft = this.yLowLeft + y;
        rettangolo.xUpRight = this.xUpRight - x;
        rettangolo.yUpRight = this.yUpRight - y;
        return rettangolo;
    }

    public void copia(Rectangle2d rettangolo) {
        this.xLowLeft = rettangolo.xLowLeft;
        this.yLowLeft = rettangolo.yLowLeft;
        this.xUpRight = rettangolo.xUpRight;
        this.yUpRight = rettangolo.yUpRight;
    }
}
