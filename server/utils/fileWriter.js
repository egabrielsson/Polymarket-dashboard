// Generated filewriter to write JSON data to files
// so that we can view all the data we fetched from Polymarket API
// to later choose what data we actually want to display in the frontend.
// and narrow down what we actually fetch.

const fs = require("fs");
const path = require("path");

/**
 * Write JSON data to a file in the server root with pretty formatting
 * @param {string} filename - name of the file (e.g., 'tech-markets.json')
 * @param {object} data - data to write
 * @param {boolean} pretty - format with indentation (default true)
 */
function writeJsonFile(filename, data, pretty = true) {
  try {
    const outputPath = path.join(__dirname, "..", "debug", filename);

    // Ensure debug directory exists
    const debugDir = path.dirname(outputPath);
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    const jsonString = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    fs.writeFileSync(outputPath, jsonString, "utf-8");

    console.log(`✓ Written to: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("Error writing JSON file:", err.message);
    throw err;
  }
}

module.exports = { writeJsonFile };
