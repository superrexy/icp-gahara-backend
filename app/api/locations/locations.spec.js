let tokenValueAdmin;
let tokenValueUser;

describe("Locations Testing", () => {
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

  it("Get Location", async () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/v1/locations",
      headers: {
        Authorization: "Bearer " + tokenValueAdmin,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
    });
  });

  it("Update Location with Admin Role", async () => {
    cy.request({
      method: "PUT",
      url: "http://localhost:3000/api/v1/locations/update",
      headers: {
        Authorization: "Bearer " + tokenValueAdmin,
      },
      body: {
        address: "Testing",
        latitude: -6.9039,
        longitude: 107.6186,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
      expect(response.body.data.address).to.eq("Testing");
    });
  });

  it("Update Location with User Role", async () => {
    cy.request({
      method: "PUT",
      url: "http://localhost:3000/api/v1/locations/update",
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
      body: {
        address: "Testing",
        latitude: -6.9039,
        longitude: 107.6186,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(401);
      expect(response.body.status).to.eq(false);
    });
  });
});
