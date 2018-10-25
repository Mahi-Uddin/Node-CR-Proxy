'use strict';

const nacl = require('./nacl');
const EMsg = require('../enums/emsg');
const Nonce = require('./nonce.js');

class Crypto {
    constructor(settings) {
        this.serverKey = Buffer.from(settings.serverKey, "hex");
        this.clientSecretKey = Buffer.from("85980ab6075cc197ab8de0faba3c699682b459979365435144482f5ebae82145", "hex");
        this.clientPublicKey = nacl.box.keyPair.fromSecretKey(this.clientSecretKey).publicKey;
        this.sessionKey = null;
        this.nonce = null;
        this.rnonce = null;
        this.snonce = null;
        this.s = null;
        this.k = null;
    }

    decryptClientPacket(message) {
        if (message.messageType == EMsg.ClientHello) {
            message.decrypted = message.payload;
        }
        else if (message.messageType == EMsg.Login) {
            let clientKey = Buffer.from(message.payload.slice(0, 32)).toString('hex');

            if (clientKey != Buffer.from(this.clientPublicKey).toString('hex')) {
                console.log("Looks like frida wasn't attached properly to your device since client pk don\'t match with the static one !");
            }

            let cipherText = message.payload.slice(32);
            this.s = nacl.box.before(this.serverKey, this.clientSecretKey);
            this.nonce = new Nonce({ clientKey: this.clientPublicKey, serverKey: this.serverKey });

            message.decrypted = nacl.box.open.after(cipherText, this.nonce.buffer, this.s);

            if (message.decrypted) {
                this.snonce = new Nonce(message.decrypted.slice(24, 48));
                message.decrypted = message.decrypted.slice(48);
            }
        }
        else {
            this.snonce.increment();
            message.decrypted = nacl.box.open.after(payload, this.snonce.buffer, this.k)
            message.decrypted = this.decrypt(message.payload);
        }
    }


    encryptClientPacket(message) {
        if (message.messageType == EMsg.ClientHello) {
            message.encrypted = message.decrypted;
        }
        else if (message.messageType == EMsg.Login) {
            let payload = Buffer.concat([this.sessionKey, this.snonce.buffer, message.decrypted]);
            let encrypted = nacl.box.after(payload, this.nonce.buffer, this.s);
            message.encrypted = Buffer.concat([this.clientPublicKey, encrypted]);
        }
        else {
            return nacl.box.after(payload, this.snonce.buffer, this.k)
        }
    }

    decryptServerPacket(message) {
        if (message.messageType == EMsg.ServerHello) {
            this.sessionKey = message.payload.slice(0, 24);
            message.decrypted = message.payload;
        }
        else if (message.messageType == EMsg.LoginFailed && !this.sessionKey) {
            message.decrypted = message.payload;
        }
        else if (message.messageType == EMsg.LoginFailed || message.messageType == EMsg.LoginOk) {
            let nonce = new Nonce({ clientKey: this.clientPublicKey, serverKey: this.serverKey, nonce: this.snonce });
            let decrypted = nacl.box.open.after(message.encrypted, this.nonce, this.s);

            this.rnonce = new Nonce(decrypted.slice(0, 24));
            this.k = decrypted.slice(24, 56);
            message.decrypted = decrypted.slice(56);
        }
        else {
            this.rnonce.increment();
            message.decrypted = nacl.box.open.after(message.encrypted, this.rnonce, this.k);
        }
    }

    encryptServerPacket(message) {
        if (message.messageType == EMsg.ServerHello || (message.messageType == EMsg.LoginFailed && !this.sessionKey)) {
            message.encrypted = message.decrypted;
        }
        else if (message.messageType == EMsg.LoginOk || message.messageType == EMsg.LoginFailed) {
            let nonce = new Nonce({ clientKey: this.clientPublicKey, serverKey: this.serverKey, nonce: this.snonce })
            let payload = Buffer.concat([this.rnonce.buffer, this.k, message.decrypted]);
            let encrypted = nacl.box.after(payload, nonce.buffer, this.s);
            message.encrypted = encrypted;
        }
        else {
            return nacl.box.after(message.decrypted, this.rnonce.buffer, this.k);
        }
    }
}

module.exports = Crypto;
