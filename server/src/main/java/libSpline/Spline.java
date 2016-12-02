package libSpline;

import java.util.ArrayList;
import libGeometry.*;

public class Spline {

    private final ArrayList<Punto3d> osservazioni;
    private final Griglia griglia;
    private final ArrayList<Punto2i> nodi;

    public Spline(Griglia griglia, ArrayList osservazioni) {
        this.griglia = griglia;
        this.osservazioni = osservazioni;
        this.nodi = new ArrayList();
    }

    protected Griglia getGriglia() {
        return this.griglia;
    }

    public ArrayList<Punto3d> getOsservazioni() {
        return osservazioni;
    }

    public ArrayList<Punto2i> getNodi() {
        return nodi;
    }

    protected void calcolaNodi(int n) {
        this.azzeraNodi();
        for (int cX = 0; cX < griglia.getNumeroNodi().getX(); cX++) {
            for (int cY = 0; cY < griglia.getNumeroNodi().getY(); cY++) {
                int numOssLowLeft = 0;
                int numOssLowRight = 0;
                int numOssUpLeft = 0;
                int numOssUpRight = 0;
                double x0 = griglia.getEstremi().getxLowLeft() + (cX - 1) * griglia.getPasso().getX();
                double x1 = griglia.getEstremi().getxLowLeft() + (cX) * griglia.getPasso().getX();
                double x2 = griglia.getEstremi().getxLowLeft() + (cX + 1) * griglia.getPasso().getX();
                double y0 = griglia.getEstremi().getyLowLeft() + (cY - 1) * griglia.getPasso().getY();
                double y1 = griglia.getEstremi().getyLowLeft() + (cY) * griglia.getPasso().getY();
                double y2 = griglia.getEstremi().getyLowLeft() + (cY + 1) * griglia.getPasso().getY();
                Rectangle2d rectLowLeft = new Rectangle2d(x0, y0, x1, y1);
                Rectangle2d rectUpLeft = new Rectangle2d(x0, y1, x1, y2);
                Rectangle2d rectLowRight = new Rectangle2d(x1, y0, x2, y1);
                Rectangle2d rectUpRight = new Rectangle2d(x1, y1, x2, y2);
                if (cY == 0) {
                    numOssLowLeft = n;
                    numOssLowRight = n;
                } else if (cY == griglia.getNumeroNodi().getY() - 1) {
                    numOssUpLeft = n;
                    numOssUpRight = n;
                }
                if (cX == 0) {
                    numOssLowLeft = n;
                    numOssUpLeft = n;
                } else if (cX == griglia.getNumeroNodi().getX() - 1) {
                    numOssLowRight = n;
                    numOssUpRight = n;
                }
                boolean isNodo = false;
                int c = 0;

                while ((!isNodo) && (c < this.osservazioni.size())) {
                    Punto3d osservazione = this.osservazioni.get(c);
                    if (rectLowLeft.contienePunto(osservazione)) {
                        numOssLowLeft++;
                    }
                    if (rectUpLeft.contienePunto(osservazione)) {
                        numOssUpLeft++;
                    }
                    if (rectUpRight.contienePunto(osservazione)) {
                        numOssUpRight++;
                    }
                    if (rectLowRight.contienePunto(osservazione)) {
                        numOssLowRight++;
                    }
                    if ((numOssLowLeft >= n) && (numOssUpLeft >= n) && (numOssLowRight >= n) && (numOssUpRight >= n)) {
                        isNodo = true;
                        this.setNodo(cX, cY);
                    }
                    c++;
                }
            }
        }
    }

    protected boolean isNodo(int x, int y) {
        boolean isNodo = false;
        int c = 0;
        while ((!isNodo) && (c < this.nodi.size())) {
            Punto2i nodo = this.nodi.get(c);
            if ((nodo.getX() == x) && (nodo.getY() == y)) {
                isNodo = true;
            }
            c++;
        }
        return isNodo;
    }

    private void azzeraNodi() {
        this.nodi.clear();
    }

    private void setNodo(int x, int y) {
        if ((x >= 0) && (x < this.griglia.getNumeroNodi().getX()) && (y >= 0) && (y < this.griglia.getNumeroNodi().getY())) {
            this.nodi.add(new Punto2i(x, y));
        }
    }
}
