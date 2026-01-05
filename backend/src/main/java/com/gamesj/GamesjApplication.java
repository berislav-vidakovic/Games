package com.gamesj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GamesjApplication {
  private static String VERSION="v1.0.0";
  private static String VERSION_KEY="Version";
  private static String VERSION_DELIMITER="=";

  public static String getVersionInfo(){
    return VERSION_KEY+VERSION_DELIMITER+VERSION;
  }

	public static void main(String[] args) {
		SpringApplication.run(GamesjApplication.class, args);
	}

}
