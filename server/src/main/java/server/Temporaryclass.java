package server;


public class Temporaryclass {

    private final long id;
    private final String content;
    private final int sample;
    private String detail;

    public Temporaryclass(long id, String content) {
        this.id = id;
        this.content = content;
        this.sample=3;
    }

    public long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }
    
    public int getSample() {
        return sample;
    }
    
    public void setDetails(String detail) {
        this.setDetail(detail);
    }

	public String getDetail() {
		return detail;
	}

	public void setDetail(String detail) {
		this.detail = detail;
	}
}
