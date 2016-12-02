package libSpline;

public class DatiSpline {

    private int x;
    private int y;
    private int grid;
    private double valore;

    public DatiSpline(int x, int y, int grid) {
        this.x = x;
        this.y = y;
        this.grid = grid;
        this.valore = 0;
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

    public int getGrid() {
        return grid;
    }

    public void setGrid(int grid) {
        this.grid = grid;
    }

    public double getValore() {
        return valore;
    }

    public void setValore(double valore) {
        this.valore = valore;
    }
}
