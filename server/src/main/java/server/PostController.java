package server;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

import libGeometry.TabellaRelazioneLivelli;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import server.software.*;

@RestController
public class PostController {
	@ResponseBody
	@CrossOrigin
	@RequestMapping(value = "send", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> search(

			@RequestParam("layer1") MultipartFile layer1, @RequestParam("layer2") MultipartFile layer2,
			@RequestParam("points1") MultipartFile points1, @RequestParam("points2") MultipartFile points2,
			@RequestParam(value = "angolo", required = false) Double angolo,
			@RequestParam(value = "sigma", required = false) Double sigma,
			@RequestParam(value = "distanza", required = false) Double distanza,
			@RequestParam(value = "iterazioni", required = false) Integer iterazioni,
			@RequestParam(value = "attributes", required = false) List<String> attributes
	) throws IOException {
		SoftwareMain test = new SoftwareMain();
		test.setParams(angolo, sigma, distanza, iterazioni);
		test.setSource(layer1.getBytes(),points1.getBytes());
		test.setTarget(layer2.getBytes(),points2.getBytes());
		TabellaRelazioneLivelli tabellaRelazioneLivelli=null;
		if(attributes!=null){
			tabellaRelazioneLivelli=new TabellaRelazioneLivelli();
			for(int i=0;i<attributes.size()/2;i++){
				tabellaRelazioneLivelli.aggiungiRelazione(attributes.get(i),attributes.get(i+1));
			}
		}
		test.setTabellaRelazioneLivelli(tabellaRelazioneLivelli);
		
		String result = test.execute();
		System.out.println("Res ready");
		return ResponseEntity.ok().body(result);
	}

	@ResponseBody
	@CrossOrigin
	@RequestMapping(value = "getHomologus", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getHomologus(

			@RequestParam("layer1") MultipartFile layer1, @RequestParam("layer2") MultipartFile layer2,
			@RequestParam("points1") MultipartFile points1, @RequestParam("points2") MultipartFile points2,
			@RequestParam(value = "angolo", required = false) Double angolo,
			@RequestParam(value = "sigma", required = false) Double sigma,
			@RequestParam(value = "distanza", required = false) Double distanza,
			@RequestParam(value = "iterazioni", required = false) Integer iterazioni,
			@RequestParam(value = "attributes", required = false) List<String> attributes
	) throws IOException {
		SoftwareMain test = new SoftwareMain();
		test.setParams(angolo, sigma, distanza, iterazioni);
		test.setSource(layer1.getBytes(),points1.getBytes());
		test.setTarget(layer2.getBytes(),points2.getBytes());
		
		TabellaRelazioneLivelli tabellaRelazioneLivelli=null;
		if(attributes!=null){
			tabellaRelazioneLivelli=new TabellaRelazioneLivelli();
			for(int i=0;i<attributes.size()/2;i++){
				tabellaRelazioneLivelli.aggiungiRelazione(attributes.get(i),attributes.get(i+1));
			}
		}
		test.setTabellaRelazioneLivelli(tabellaRelazioneLivelli);
		String result = test.getHomologus();
		System.out.println("Res ready");
		return ResponseEntity.ok().body(result);
	}


@ResponseBody
@CrossOrigin
@RequestMapping(value = "get", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<String> get(

) throws IOException {
	
	return ResponseEntity.ok().body("hello");
}

}