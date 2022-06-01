const openpgp = require("openpgp");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const folderkey = "keys";
const privateKeyArmored = fs.readFileSync(path.join(process.cwd(), folderkey, "secret.txt"), {
  encoding: "utf8",
  flag: "r",
});
const passphrase = fs.readFileSync(path.join(process.cwd(), folderkey, "passphrase.txt"), {
  encoding: "utf8",
  flag: "r",
});
const directoryPath = path.join(process.cwd(), "documents");

const config = require("./config/config.json");
let active = false;
if (!active) main();
/*
  * * * * * GUIÓN PARA EJECUTAR TAREA PROGRAMADA DE CRON
  │ │ │ │ │
  │ │ │ │ │
  │ │ │ │ |_________   Día de la semana (0 - 6) (0 es domingo, o use nombres)
  │ │ │ |____________ Mes (1 - 12), * significa todos los meses
  │ │ |______________  Día del mes (1 - 31), * significa todos los días
  │ |________________  Hora (0 - 23), * significa cada hora
  |___________________ Minuto (0 - 59), * significa cada minuto
*/
cron.schedule(`*/${config.period} * * * *`, async () => {
  console.log("************EJECUTANDO TAREA PROGRAMADO**************");
  if (!active) main();
});

async function main() {
  active = true;
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase,
  });

  // Leer todos los archivos encriptados de la carpeta a solicitar
  const filesEncrypted = fs.readdirSync(path.join(directoryPath, "encrypted"));

  // Recorrer cada archivo y desencriptarlo
  console.log("Desencriptando lista de archivos:\n");
  for (let j = 0; j < filesEncrypted.length; j++) {
    try {
      const filenameEcr = filesEncrypted[j];
      console.log(filenameEcr);
      const encryptedData = fs.readFileSync(path.join(directoryPath, "encrypted", filenameEcr), { encoding: "utf8", flag: "r" });

      const message = await openpgp.readMessage({ armoredMessage: encryptedData });
      const decrypted = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
        config: { allowInsecureDecryptionWithSigningKeys: true },
      });
      fs.writeFileSync(path.join(directoryPath, "decrypted", filenameEcr), decrypted.data);
    } catch (error) {
      console.log("Error al desencriptar archivo:", error);
    }
  }
  active = false;
}
