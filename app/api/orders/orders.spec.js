let tokenValueAdmin;
let tokenValueUser;
let orderId;

describe("Orders Testing", () => {
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

  it("Create Order", async () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/v1/orders/create",
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
      body: {
        name_rent: "Testing User",
        no_ktp: "1234567890",
        address: "Jalan Testing",
        phone: "081234567890",
        rental_purposes: "Testing",
        start_date: "2023-01-09T11:06:51+0000",
        end_date: "2023-01-10T11:06:51+0000",
        car_id: "1",
      },
    }).then((response) => {
      orderId = response.body.data.id;

      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(201);
      expect(response.body.status).to.eq(true);
    });
  });

  it("Get Orders", async () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/v1/orders",
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
    });
  });

  it("Get Order By ID", async () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/v1/orders/" + orderId,
      headers: {
        Authorization: "Bearer " + tokenValueUser,
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
      expect(response.body.data.name_rent).to.eq("Testing User");
    });
  });
});
