package libSpline;

import libGeometry.Punto3d;
import libMath.Matrix;
import libGeometry.Mappa;

public class Trasforma {

    public static void conSpline(Mappa mappa, MultiSpline mX, MultiSpline mY) {
        int n = mappa.getNumeroVertici();
        for (int c = 0; c < n; c++) {
            Punto3d p = mappa.getVertice(c);
            p.setX(p.getX() + mX.interpola(p));
            p.setY(p.getY() + mY.interpola(p));
        }
        mappa.calcolaEstremi();
    }

    public static void conAffine(Mappa mappa, Matrix parametri) {
        Matrix T = new Matrix(2, 6);
        Matrix x2y2;
        int n = mappa.getNumeroVertici();
        for (int c = 0; c < n; c++) {
            Punto3d p = mappa.getVertice(c);
            double[] v1 = {1, 0, p.getX(), p.getY(), 0, 0};
            double[] v2 = {0, 1, 0, 0, p.getX(), p.getY()};
            T.set(0, v1);
            T.set(1, v2);
            x2y2 = T.times(parametri);
            p.setX(x2y2.get(0));
            p.setY(x2y2.get(1));
        }
        mappa.calcolaEstremi();
    }
}
