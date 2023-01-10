let tokenValueAdmin;
let tokenValueUser;

let carId;

describe("Cars Testing", () => {
  it("Login with role admin", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/v1/auth/login",
      body: {
        email: "admin@icp-gahara.com",
        password: "password",
      },
    }).then((response) => {
      tokenValueAdmin = response.body.data.token;

      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
      expect(response.body.data.user.role).to.eq("admin");
    });
  });

  it("Login with role user", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/v1/auth/login",
      body: {
        email: "user@icp-gahara.com",
        password: "password",
      },
    }).then((response) => {
      tokenValueUser = response.body.data.token;

      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
      expect(response.body.data.user.role).to.eq("user");
    });
  });

  it("Get Cars", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/v1/cars",
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
    });
  });

  it("Create Car", () => {
    cy.fixture("honda_jazz.png", "binary").then((fileContent) => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, "image/jpeg");
      const formData = new FormData();
      formData.append("car_image", blob, "honda_jazz.png");
      formData.append("name", "Test Car");
      formData.append("description", "Test Description");
      formData.append("price", 1000000);
      formData.append("seats", 4);
      formData.append("type_fuel", "Bensin");
      formData.append("type_car", "Family");
      formData.append("transmision", "Manual");

      cy.request({
        method: "POST",
        url: "http://localhost:3000/api/v1/cars/create",
        headers: {
          Authorization: "Bearer " + tokenValueAdmin,
          Accept: "application/json",
          ContentType: "multipart/form-data",
        },
        body: formData,
      }).then((response) => {
        const bodyString = Cypress.Blob.arrayBufferToBinaryString(
          response.body
        );
        const body = JSON.parse(bodyString);

        carId = body.data.id;
        cy.log(JSON.stringify(body));
        expect(response.status).to.eq(201);
        expect(body.status).to.eq(true);
      });
    });
  });

  it("Get Car by ID", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/v1/cars/" + carId,
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
      expect(response.body.data.name).to.eq("Test Car");
    });
  });

  it("Update Car", () => {
    cy.fixture("honda_jazz.png", "binary").then((fileContent) => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, "image/jpeg");
      const formData = new FormData();
      formData.append("car_image", blob, "honda_jazz.png");
      formData.append("name", "Test Car Update");
      formData.append("description", "Test Description");
      formData.append("price", 1000000);
      formData.append("seats", 4);
      formData.append("type_fuel", "Bensin");
      formData.append("type_car", "Family");
      formData.append("transmision", "Manual");

      cy.request({
        method: "PUT",
        url: `http://localhost:3000/api/v1/cars/${carId}/update`,
        headers: {
          Authorization: "Bearer " + tokenValueAdmin,
        },
        body: formData,
      }).then((response) => {
        const bodyString = Cypress.Blob.arrayBufferToBinaryString(
          response.body
        );
        const body = JSON.parse(bodyString);
        cy.log(JSON.stringify(body));
        expect(response.status).to.eq(200);
        expect(body.status).to.eq(true);
        expect(body.data.name).to.eq("Test Car Update");
      });
    });
  });

  it("Delete Car", () => {
    cy.request({
      method: "DELETE",
      url: `http://localhost:3000/api/v1/cars/${carId}/delete`,
      headers: {
        Authorization: "Bearer " + tokenValueAdmin,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
    });
  });
});
