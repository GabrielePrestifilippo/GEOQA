package libGeometry;

import java.util.*;

public class Mappa {

    private Rectangle2d boundingBox;
    private final ArrayList<Entita> elencoEntita;
    private final Rectangle2d squaredBoundingBox;
    private final ArrayList<Punto3d> puntiOmologhi;
    private final ArrayList<Punto3d> elencoVertici;
    private final QuadTree quadTreeOmologhi;
    private final ArrayList<String> elencoLivelli;
    private final QuadTree quadTreeVertici;
    private final Map<String, ArrayList> entitaPerLivello;
    public byte[] omologhiBeforeTransformation;

    public Mappa() {
        boundingBox = new Rectangle2d();
        squaredBoundingBox = new Rectangle2d();
        elencoEntita = new ArrayList();
        elencoVertici = new ArrayList();
        puntiOmologhi = new ArrayList();
        elencoLivelli = new ArrayList();
        Rectangle2d estremiQuadTree = new Rectangle2d(boundingBox);
        estremiQuadTree.maggiora(1);
        quadTreeVertici = new QuadTree(estremiQuadTree, 50, 50, this.elencoVertici);
        quadTreeOmologhi = new QuadTree(estremiQuadTree, 50, 50, this.puntiOmologhi);
        this.entitaPerLivello = new HashMap();
        this.omologhiBeforeTransformation=null;
    }

    protected void setEstremi(Rectangle2d estremi) {
        this.boundingBox = estremi;
        this.squaredBoundingBox.copia(this.boundingBox);
        this.squaredBoundingBox.squadra();
        this.squaredBoundingBox.maggiora(5);
        this.quadTreeVertici.setEstremi(this.squaredBoundingBox);
        this.quadTreeOmologhi.setEstremi(this.squaredBoundingBox);
    }

    public void aggiungiLivello(String livello) {
        if (!this.elencoLivelli.contains(livello)) {
            this.elencoLivelli.add(livello);
        }
    }

    public ArrayList<String> getElencoLivelli() {
        return this.elencoLivelli;
    }

    public ArrayList<Punto3d> getElencoVertici() {
        return elencoVertici;
    }

    public Punto3d getPuntoOmologo(int indice) {
        return this.puntiOmologhi.get(indice);
    }

    public Punto3d getVertice(int indice) {
        return this.elencoVertici.get(indice);
    }

    public void inserisciVertice(Punto3d vertice) {
        this.quadTreeVertici.inserisciVertice(vertice);
    }

    public Punto3d getVertice(Punto3d vertice) {
        return this.quadTreeVertici.getVertice(vertice);
    }

    public int getIndicePuntoOmologo(Punto3d punto) {
        return this.puntiOmologhi.indexOf(punto);
    }

    public int getIndiceVertice(Punto3d punto) {
        return this.elencoVertici.indexOf(punto);
    }

    public ArrayList<Punto3d> getPuntiOmologhi() {
        return this.puntiOmologhi;
    }

    public QuadTree getQuadTreeVertici() {
        return this.quadTreeVertici;
    }

    public void addEntita(Entita entita) {
        this.elencoEntita.add(entita);
    }

    public Entita getEntita(int indice) {
        return this.elencoEntita.get(indice);
    }

    public ArrayList<Entita> getElencoEntita() {
        return this.elencoEntita;
    }

    public void setEntitaPerLivelli() {
        ArrayList elenco;
        if (!this.elencoEntita.isEmpty()) {
            for (int c = 0; c < this.elencoEntita.size(); c++) {
                Entita entita = this.elencoEntita.get(c);
                String livello = entita.getCodice();
                if (!entitaPerLivello.containsKey(livello)) {
                    elenco = new ArrayList();
                    elenco.add(entita);
                    entitaPerLivello.put(livello, elenco);
                } else {
                    elenco = entitaPerLivello.get(livello);
                    elenco.add(entita);
                }
            }
        }
    }

    public int getNumeroPuntiOmologhi() {
        return this.puntiOmologhi.size();
    }

    public int getNumeroVertici() {
        return this.elencoVertici.size();
    }

    public int getNumeroEntita() {
        return this.elencoEntita.size();
    }

    public Punto3d getOmologo(Punto3d punto) {
        return this.quadTreeOmologhi.getVertice(punto);
    }

    public boolean setOmologo(Punto3d punto) {
        Punto3d p = this.quadTreeVertici.getVertice(punto);
        if (p != null) {
            return this.quadTreeOmologhi.inserisciVertice(p);
        } else {
            return false;
        }
    }

    public Rectangle2d getBoundingBox() {
        return boundingBox;
    }

    public void setBoundingBox(Rectangle2d boundingBox) {
        this.boundingBox = boundingBox;
    }

    public void rimuoviPuntoOmologo(Punto3d puntoDaEliminare) {
        this.quadTreeOmologhi.rimuoviVertice(puntoDaEliminare);
    }

    public void resettaPuntiOmologhi() {
        this.quadTreeOmologhi.resetta();
    }

    public void calcolaEstremi() {
        Entita entita;
        this.boundingBox.resetta();
        for (int c1 = 0; c1 < this.elencoEntita.size(); c1++) {
            entita = this.elencoEntita.get(c1);
            for (int c2 = 0; c2 < entita.getNumeroVertici(); c2++) {
                Punto3d vertice = entita.getVertice(c2);
                if (vertice.x < this.boundingBox.xLowLeft) {
                    this.boundingBox.xLowLeft = vertice.x;
                }
                if (vertice.x > this.boundingBox.xUpRight) {
                    this.boundingBox.xUpRight = vertice.x;
                }
                if (vertice.y < this.boundingBox.yLowLeft) {
                    this.boundingBox.yLowLeft = vertice.y;
                }
                if (vertice.y > this.boundingBox.yUpRight) {
                    this.boundingBox.yUpRight = vertice.y;
                }
            }
        }
        this.squaredBoundingBox.copia(this.boundingBox);
        this.squaredBoundingBox.squadra();
        this.squaredBoundingBox.maggiora(5);
        this.quadTreeVertici.setEstremi(this.squaredBoundingBox);
        this.quadTreeOmologhi.setEstremi(this.squaredBoundingBox);
        for (int c = 0; c < this.getNumeroEntita(); c++) {
            (this.elencoEntita.get(c)).calcolaBoundingBox();
        }
    }

    public static Mappa creaCopia(Mappa originale, String suffisso) {
        Mappa mappa = new Mappa();
        mappa.setEstremi(new Rectangle2d(originale.getBoundingBox()));
        Entita copiaEntita, entita;
        Punto3d vertice;
        for (int c1 = 0; c1 < originale.elencoEntita.size(); c1++) {
            entita = originale.elencoEntita.get(c1);
            copiaEntita = new Entita(mappa);
            copiaEntita.setCodice(entita.getCodice() + suffisso);
            for (int c2 = 0; c2 < entita.getNumeroVertici(); c2++) {
                vertice = entita.getVertice(c2);
                copiaEntita.addVertice(new Punto3d(vertice.x, vertice.y));
            }
            mappa.elencoEntita.add(copiaEntita);
        }
        for (int c = 0; c < originale.puntiOmologhi.size(); c++) {
            mappa.setOmologo(originale.puntiOmologhi.get(c));
        }
        ArrayList<String> elencoLivello = originale.elencoLivelli;
        for (int c = 0; c < elencoLivello.size(); c++) {
            mappa.elencoLivelli.add(elencoLivello.get(c) + suffisso);
        }
        mappa.calcolaEstremi();
        mappa.setEntitaPerLivelli();
        return mappa;
    }

    public Map<String, QuadTree> getQuadTreeLivelli() {
        Map<String, QuadTree> quadTreeLivelli = new HashMap();
        for (int c = 0; c < elencoLivelli.size(); c++) {
            String livello = elencoLivelli.get(c);
            Rectangle2d estremiQuad = new Rectangle2d(boundingBox);
            estremiQuad.maggiora(1);
            QuadTree quadLivello = new QuadTree(estremiQuad, 50, 50, this.elencoVertici);
            quadTreeLivelli.put(livello, quadLivello);
        }
        for (int c1 = 0; c1 < this.elencoEntita.size(); c1++) {
            Entita entita = elencoEntita.get(c1);
            QuadTree quad = quadTreeLivelli.get(entita.getCodice());
            if (quad != null) {
                for (int c2 = 0; c2 < entita.getNumeroVertici(); c2++) {
                    Punto3d vertice = entita.getVertice(c2);
                    Punto3d punto = quad.getVertice(vertice);
                    if (punto == null) {
                        quad.setVertice(vertice);
                    }
                }
            }
        }
        return quadTreeLivelli;
    }

    public void calcolaAngoliLivello(String nomeLivello) {
        for (int c = 0; c < this.elencoVertici.size(); c++) {
            this.elencoVertici.get(c).annullaAngoli();
        }
        for (int c = 0; c < this.elencoEntita.size(); c++) {
            Entita entita = elencoEntita.get(c);
            if (nomeLivello.equals("ALL")) {
                entita.calcolaAngoli();
            } else {
                String livello = entita.getCodice();
                if (livello.equals(nomeLivello)) {
                    entita.calcolaAngoli();
                }
            }
        }
    }

}
