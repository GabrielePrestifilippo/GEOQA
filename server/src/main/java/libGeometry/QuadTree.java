package libGeometry;

import java.util.ArrayList;

public class QuadTree implements java.io.Serializable {

    private Rectangle2d estremi;
    private final Punto2d delta;
    private final Punto2i size;
    private final ArrayList<Punto3d>[][] celle;
    private final ArrayList<Punto3d> elencoPunti;

    public QuadTree(Rectangle2d bound, int nX, int nY, ArrayList elencoPunti) {
        this.size = new Punto2i(nX, nY);
        this.estremi = bound;
        this.delta = new Punto2d();
        this.delta.x = estremi.larghezza() / (nX);
        this.delta.y = estremi.altezza() / (nY);
        this.elencoPunti = elencoPunti;
        celle = new ArrayList[nX][nY];
    }

    public void setEstremi(Rectangle2d bound) {
        this.estremi = bound;
        this.delta.x = estremi.larghezza() / (this.size.x);
        this.delta.y = estremi.altezza() / (this.size.y);
        for (int cX = 0; cX < this.size.x; cX++) {
            for (int cY = 0; cY < this.size.y; cY++) {
                celle[cX][cY] = null;
            }
        }
        for (int c = 0; c < this.elencoPunti.size(); c++) {
            this.setVertice(this.elencoPunti.get(c));
        }
    }

    public Rectangle2d getEstremi() {
        return this.estremi;
    }

    public ArrayList<Punto3d> getCella(int x, int y) {
        return this.celle[x][y];
    }

    public Punto2d getPasso() {
        return this.delta;
    }

    public Punto2i getNumeroCelle() {
        return this.size;
    }

    public int iX(Punto3d dato) {
        return (int) ((dato.x - this.estremi.xLowLeft) / this.delta.x);
    }

    public int iX(double coordX) {
        return (int) ((coordX - this.estremi.xLowLeft) / this.delta.x);
    }

    public int iY(Punto3d dato) {
        return (int) ((dato.y - this.estremi.yLowLeft) / this.delta.y);
    }

    public int iY(double coordY) {
        return (int) ((coordY - this.estremi.yLowLeft) / this.delta.y);
    }

    public int getNumeroTotaleCelle() {
        return this.size.x * this.size.y;
    }

    public boolean inserisciVertice(Punto3d punto) {
        if (this.estremi.contienePunto(punto)) {
            if (this.celle[this.iX(punto)][this.iY(punto)] == null) {
                this.celle[this.iX(punto)][this.iY(punto)] = new ArrayList();
            }
            this.celle[this.iX(punto)][this.iY(punto)].add(punto);
            this.elencoPunti.add(punto);
            return true;
        } else {
            return false;
        }
    }

    public void rimuoviVertice(Punto3d punto) {
        this.celle[this.iX(punto)][this.iY(punto)].remove(punto);
        this.elencoPunti.remove(punto);
    }

    public void setVertice(Punto3d punto) {
        if (this.estremi.contienePunto(punto)) {
            if (this.celle[this.iX(punto)][this.iY(punto)] == null) {
                this.celle[this.iX(punto)][this.iY(punto)] = new ArrayList();
            }
            this.celle[this.iX(punto)][this.iY(punto)].add(punto);
        }
    }

    public Punto3d getVertice(Punto3d punto) {
        Punto3d vertice = null;
        if (this.estremi.contienePunto(punto)) {
            if (this.celle[this.iX(punto)][this.iY(punto)] != null) {
                boolean trovato = false;
                ArrayList<Punto3d> cella = this.celle[this.iX(punto)][this.iY(punto)];
                for (int c = 0; c < cella.size() && !trovato; c++) {
                    Punto3d puntoQuad = cella.get(c);
                    if ((puntoQuad.x == punto.x) && (puntoQuad.y == punto.y)) {
                        trovato = true;
                        vertice = puntoQuad;
                    }
                }
            }
        }
        return vertice;
    }

    public Rectangle2i getEstremiQuadri(Rectangle2d rettangolo) {
        Rectangle2i estremiQuadri = new Rectangle2i();
        estremiQuadri.setxLowLeft(Math.max(0, iX(rettangolo.getxLowLeft())));
        estremiQuadri.setxUpRight(Math.min(this.size.x - 1, iX(rettangolo.getxUpRight())));
        estremiQuadri.setyLowLeft(Math.max(0, iY(rettangolo.getyLowLeft())));
        estremiQuadri.setyUpRight(Math.min(this.size.y - 1, iY(rettangolo.getyUpRight())));
        return estremiQuadri;
    }

    public void resetta() {
        for (int cX = 0; cX < this.size.x; cX++) {
            for (int cY = 0; cY < this.size.y; cY++) {
                celle[cX][cY] = null;
            }
        }
        this.elencoPunti.clear();
    }

}
