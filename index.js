const fs = require("fs");

/**
 * Process the users and companies data and generate the output file.
 * @param {string} usersPath - The path to the users JSON file.
 * @param {string} companiesPath - The path to the companies JSON file.
 * @param {string} outputPath - The path to the output file.
 */
function processUserData(usersPath, companiesPath, outputPath) {
  try {
    // Read the users JSON file
    const usersData = fs.readFileSync(usersPath);
    const users = JSON.parse(usersData);

    // Read the companies JSON file
    const companiesData = fs.readFileSync(companiesPath);
    const companies = JSON.parse(companiesData);

    // Filter active users belonging to a company
    const activeUsers = users.filter(
      (user) =>
        user.active_status &&
        companies.find((company) => company.id === user.company_id)
    );

    // Sort companies by company id
    companies.sort((a, b) => a.id - b.id);

    // Sort active users alphabetically by last name
    activeUsers.sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Process each company
    const output = companies.map((company) => {
      const companyUsers = activeUsers.filter(
        (user) => user.company_id === company.id
      );
      const companyTokenTopUp = company.top_up;

      let message = `Company Id: ${company.id}\n`;
      message += `Company Name: ${company.name}\n`;
      message += `Users Emailed:\n`;

      const usersEmailed = companyUsers.filter((user) => user.email_status);
      usersEmailed.forEach((user) => {
        const previousTokenBalance = user.tokens;
        const newTokenBalance = previousTokenBalance + companyTokenTopUp;
        message += `\t${user.last_name}, ${user.first_name}, ${user.email}\n`;
        message += `\t  Previous Token Balance: ${previousTokenBalance}\n`;
        message += `\t  New Token Balance: ${newTokenBalance}\n`;
        user.tokens = newTokenBalance;
      });

      message += `Users Not Emailed:\n`;
      const usersNotEmailed = companyUsers.filter((user) => !user.email_status);
      usersNotEmailed.forEach((user) => {
        const previousTokenBalance = user.tokens;
        const newTokenBalance = previousTokenBalance + companyTokenTopUp;
        message += `\t${user.last_name}, ${user.first_name}, ${user.email}\n`;
        message += `\t  Previous Token Balance: ${previousTokenBalance}\n`;
        message += `\t  New Token Balance: ${newTokenBalance}\n`;
        user.tokens = newTokenBalance;
      });

      const totalTopUp = companyUsers.length * companyTokenTopUp;
      message += `Total amount of top ups for ${company.name}: ${totalTopUp}\n`;

      return message;
    });

    // Write output to file
    fs.writeFileSync(outputPath, output.join("\n"));

    console.log(`${outputPath} file created successfully!`);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Example usage
const usersPath = "users.json";
const companiesPath = "companies.json";
const outputPath = "output.txt";
processUserData(usersPath, companiesPath, outputPath);
