package server.software;

public class ResultJSON {
	
	private String statistics;
	private String resultMap;
	private String resultPoints;
	private String resultPoints1;
	
	public ResultJSON(){

	}

	public String getStatistics() {
		return statistics;
	}

	public void setStatistics(String statistics) {
		this.statistics = statistics;
	}

	public String getResultMap() {
		return resultMap;
	}

	public void setResultMap(String resultMap) {
		this.resultMap = resultMap;
	}

	public String getPoints() {
		return this.resultPoints;
	}

	public void setPoints(String ds) {
		this.resultPoints = ds;
	}
	
	public void setPoints1(String ds) {
		this.resultPoints1 = ds;
	}

}
