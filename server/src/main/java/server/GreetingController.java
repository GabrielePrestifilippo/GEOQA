package server;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
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
public class GreetingController {

	@ResponseBody
	@CrossOrigin
	@RequestMapping(value = "send", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> search(

			@RequestParam("layer1") MultipartFile layer1, @RequestParam("layer2") MultipartFile layer2,
			@RequestParam("points1") MultipartFile points1, @RequestParam("points2") MultipartFile points2,
			@RequestParam(value = "angolo", required = false) Double angolo,
			@RequestParam(value = "sigma", required = false) Double sigma,
			@RequestParam(value = "distanza", required = false) Double distanza

	) throws IOException {

		try {

			String directory = "./Dati/";
			String filepath = Paths.get(directory, "OSM00.car").toString();
			String filepath1 = Paths.get(directory, "DBT00.car").toString();
			String filepath2 = Paths.get(directory, "OSM00.omo").toString();
			String filepath3 = Paths.get(directory, "DBT00.omo").toString();

			BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(new File(filepath)));
			stream.write(layer1.getBytes());
			stream.close();

			BufferedOutputStream stream1 = new BufferedOutputStream(new FileOutputStream(new File(filepath1)));
			stream1.write(layer2.getBytes());
			stream1.close();

			BufferedOutputStream stream2 = new BufferedOutputStream(new FileOutputStream(new File(filepath2)));
			stream2.write(points1.getBytes());
			stream2.close();

			BufferedOutputStream stream3 = new BufferedOutputStream(new FileOutputStream(new File(filepath3)));
			stream3.write(points2.getBytes());
			stream3.close();
		}

		catch (Exception e) {
			System.out.println(e.getMessage());
		}

		SoftwareMain test = new SoftwareMain();

		test.setParams(angolo, sigma, distanza);

		test.setSource("Dati/OSM00.car");
		test.setTarget("Dati/DBT00.car");
	
		String result = test.execute();
		System.out.println("Res ready");
		return ResponseEntity.ok().body(result);
	}

}
