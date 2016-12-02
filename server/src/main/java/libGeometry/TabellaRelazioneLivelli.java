package libGeometry;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;

public class TabellaRelazioneLivelli {

    private final HashMap<String, ArrayList> relazioniS;
    private final HashMap<String, ArrayList> relazioniT;

    public TabellaRelazioneLivelli() {
        relazioniS = new HashMap();
        relazioniT = new HashMap();
    }

    public void resetta() {
        relazioniS.clear();
        relazioniT.clear();
    }

    public void aggiungiRelazione(String nomeLivello1, String nomeLivello2) {

        if (!relazioniS.containsKey(nomeLivello1)) {
            ArrayList relazioni = new ArrayList();
            relazioni.add(nomeLivello2);
            relazioniS.put(nomeLivello1, relazioni);
        } else {
            ArrayList relazioni = relazioniS.get(nomeLivello1);
            if (!relazioni.contains(nomeLivello2)) {
                relazioni.add(nomeLivello2);
            }
        }
        if (!relazioniT.containsKey(nomeLivello2)) {
            ArrayList relazioni = new ArrayList();
            relazioni.add(nomeLivello1);
            relazioniT.put(nomeLivello2, relazioni);
        } else {
            ArrayList relazioni = relazioniT.get(nomeLivello2);
            if (!relazioni.contains(nomeLivello1)) {
                relazioni.add(nomeLivello1);
            }
        }
    }

    public void rimuoviRelazione(String nomeLivello1, String nomeLivello2) {
        if (relazioniS.containsKey(nomeLivello1)) {
            ArrayList relazioni = relazioniS.get(nomeLivello1);
            if (relazioni.contains(nomeLivello2)) {
                relazioni.remove(nomeLivello2);
            }
        }
        if (relazioniT.containsKey(nomeLivello2)) {
            ArrayList relazioni = relazioniT.get(nomeLivello2);
            if (relazioni.contains(nomeLivello1)) {
                relazioni.remove(nomeLivello1);
            }
        }
    }

    public ArrayList getElencoLivelli(boolean source, String nomeLivello) {
        if (source) {
            return relazioniS.get(nomeLivello);
        } else {
            return relazioniT.get(nomeLivello);
        }
    }

    public int getNumeroRelazioni(boolean source) {
        if (source) {
            return relazioniS.size();
        } else {
            return relazioniT.size();
        }
    }

    public Set getKeys(boolean source) {
        if (source) {
            return relazioniS.keySet();
        } else {
            return relazioniT.keySet();
        }
    }
}
