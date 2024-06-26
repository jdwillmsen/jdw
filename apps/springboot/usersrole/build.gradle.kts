import org.springframework.boot.gradle.tasks.bundling.BootBuildImage

plugins {
	java
	id("org.springframework.boot") version "3.2.5"
	id("io.spring.dependency-management") version "1.1.4"
	id("maven-publish")
}

group = "com.jdw"
version = "0.1.0"

java {
	sourceCompatibility = JavaVersion.VERSION_21
	targetCompatibility = JavaVersion.VERSION_21
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	compileOnly("org.projectlombok:lombok")
	runtimeOnly("org.postgresql:postgresql")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.boot:spring-boot-testcontainers")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

springBoot {
	buildInfo()
}

publishing {
	publications {
		create<MavenPublication>("mavenJava") {
			artifact(tasks.getByName("bootJar"))
		}
	}
}

tasks.named<BootBuildImage>("bootBuildImage") {
	imageName.set("docker.io/jdwillmsen/jdw-${project.name}:${version}")
	publish.set(true)
	tags.set(listOf("docker.io/jdwillmsen/jdw-${project.name}:latest"))
	docker {
		publishRegistry {
			username.set(System.getenv("DOCKERHUB_USERNAME"))
			password.set(System.getenv("DOCKERHUB_PASSWORD"))
		}
	}
}