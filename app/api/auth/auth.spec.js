describe("Auth Testing", () => {
  it("Register a new user", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/v1/auth/register",
      body: {
        full_name: "Test User",
        no_ktp: "1234567890",
        email: "test@mail.com",
        password: "password",
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(201);
      expect(response.body.status).to.eq(true);
    });
  });

  it("Login with the new user", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/v1/auth/login",
      body: {
        email: "test@mail.com",
        password: "password",
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq(true);
    });
  });
});
