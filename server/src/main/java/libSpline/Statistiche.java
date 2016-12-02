package libSpline;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import libGeometry.Punto3d;
import libMath.Matrix;

public class Statistiche {

    private final Matrix elencoDeltaX;
    private final Matrix elencoDeltaY;
    private final Matrix elencoDistanze;
    private final double mediaDeltaX;
    private final double mediaDeltaY;
    private final double mediaDistanze;
    private final double varianzaDeltaX;
    private final double varianzaDeltaY;
    private final double varianzaDistanze;
    private double distanzaMassima = Double.MIN_VALUE;
    private double distanzaMinima = Double.MAX_VALUE;
    private final int numeroPunti;

    public Statistiche(ArrayList<Punto3d> source, ArrayList<Punto3d> target) {
        this.numeroPunti = source.size();
        this.elencoDeltaX = new Matrix(numeroPunti, 1);
        this.elencoDeltaY = new Matrix(numeroPunti, 1);
        this.elencoDistanze = new Matrix(numeroPunti, 1);
        for (int c = 0; c < this.numeroPunti; c++) {
            Punto3d pS = source.get(c);
            Punto3d pT = target.get(c);
            double dX = pS.getX() - pT.getX();
            double dY = pS.getY() - pT.getY();
            double distanza = Math.sqrt(dX * dX + dY * dY);
            this.distanzaMassima = Math.max(this.distanzaMassima, distanza);
            this.distanzaMinima = Math.min(this.distanzaMinima, distanza);
            this.elencoDeltaX.set(c, dX);
            this.elencoDeltaY.set(c, dY);
            this.elencoDistanze.set(c, distanza);
        }
        this.mediaDeltaX = this.elencoDeltaX.mean();
        this.mediaDeltaY = this.elencoDeltaY.mean();
        this.mediaDistanze = this.elencoDistanze.mean();
        this.varianzaDeltaX = this.elencoDeltaX.varianza(this.mediaDeltaX);
        this.varianzaDeltaY = this.elencoDeltaY.varianza(this.mediaDeltaY);
        this.varianzaDistanze = this.elencoDistanze.varianza(this.mediaDistanze);
    }

    public String stampa() {
        String risultato = "punti;m(AX);v(AX);m(AY),v(AY);m(dist);v(dist);min(d);max(d)\r\n";
        DecimalFormat df = new DecimalFormat();
        df.setGroupingUsed(false);
        DecimalFormatSymbols dfs = new DecimalFormatSymbols();
        dfs.setDecimalSeparator(',');
        df.setDecimalFormatSymbols(dfs);
        df.setMaximumFractionDigits(3);
        df.setMinimumFractionDigits(3);
        risultato = risultato + this.numeroPunti + ";"
                + df.format(mediaDeltaX) + ";"
                + df.format(varianzaDeltaX) + ";"
                + df.format(mediaDeltaY) + ";"
                + df.format(varianzaDeltaY) + ";"
                + df.format(mediaDistanze) + ";"
                + df.format(varianzaDistanze) + ";"
                + df.format(distanzaMinima) + ";"
                + df.format(distanzaMassima) + "\r\n";
        return risultato;
    }
}
