import React from 'react'
import {
    PrivateKey,
    TokenCreateTransaction,
    TokenSupplyType,
    TokenType,
    Hbar,
    AccountId,
    Duration,
    CustomFee,
    CustomFixedFee,
    CustomFractionalFee, Timestamp
} from "@hashgraph/sdk";

async function TokenCreator(valuesArr, topic, hashconnect, accountId, customFees) {

    let adminKey = '';
    let adminPublicKey = '';
    let supplyKey = '';
    let supplyPublicKey = '';
    let kycKey = '';
    let kycPublicKey = '';
    let freezeKey = '';
    let freezePublicKey = '';
    let wipeKey = '';
    let wipePublicKey = '';
    let pauseKey = '';
    let pausePublicKey = '';
    let feeScheduleKey = '';
    let feeSchedulePublicKey = '';

    adminKey = PrivateKey.generateED25519();
    adminPublicKey = adminKey.publicKey;
    supplyKey = PrivateKey.generateED25519();
    supplyPublicKey = supplyKey.publicKey;
    kycKey = PrivateKey.generateED25519();
    kycPublicKey = kycKey.publicKey;
    freezeKey = PrivateKey.generateED25519();
    freezePublicKey = freezeKey.publicKey;
    wipeKey = PrivateKey.generateED25519();
    wipePublicKey = wipeKey.publicKey;
    pauseKey = PrivateKey.generateED25519();
    pausePublicKey = pauseKey.publicKey;
    feeScheduleKey = PrivateKey.generateED25519();
    feeSchedulePublicKey = feeScheduleKey.publicKey;

    const provider = hashconnect.getProvider('mainnet', topic, accountId);
    const signer = hashconnect.getSigner(provider);

    console.log("about to create the transaction")

    let expirationTime;
    if (!isNaN(valuesArr.expirationTime)) {
        expirationTime = Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + parseInt(valuesArr.expirationTime))))
        console.log('expiration: ' + parseInt(valuesArr.expirationTime))
    } else {
        expirationTime = Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 90)))
        console.log('expiration: ' + 90)
    }

    let tokenCreateTx = await new TokenCreateTransaction()
        .setMaxTransactionFee(new Hbar(300))

        .setTokenName(valuesArr.tokenName)
        .setTokenSymbol(valuesArr.tokenSymbol)
        .setTokenType(TokenType.FungibleCommon)

        .setDecimals(valuesArr.decimal)
        .setInitialSupply(valuesArr.initialSupply)
        .setMaxSupply(valuesArr.maxSupply)
        .setTreasuryAccountId(AccountId.fromString(accountId))
        .setSupplyType(TokenSupplyType.Finite)

        // .setKycKey(kycKey)
        .setFreezeKey(freezeKey)
        .setWipeKey(wipeKey)
        .setAdminKey(adminKey)
        .setSupplyKey(supplyPublicKey)
        .setFeeScheduleKey(feeScheduleKey)

        .setTokenMemo(valuesArr.memo)
        // .setAutoRenewAccountId(AccountId.fromString(accountId))
        // .setAutoRenewPeriod()
        .setFreezeDefault(false)
        .setExpirationTime(expirationTime)
        .freezeWithSigner(signer)

    //Custom Fees
    const customFeeArray = [];
    customFees.forEach((fee) => {
        if (fee.feeType === "fixed") {
            customFeeArray.push(new CustomFixedFee()
                .setHbarAmount(new Hbar(parseInt(fee.fee)))
                .setFeeCollectorAccountId(fee.address)
            )
        } else if (fee.feeType === "fractional") {
            customFeeArray.push(new CustomFractionalFee()
                .setFeeCollectorAccountId(fee.address)
                .setNumerator(parseInt(fee.fee))
                .setDenominator(100)
            )
        }
    });
    tokenCreateTx.setCustomFees(customFeeArray);

    console.log("about to sign the transaction")

    const tokenCreateTxSigned = await (await tokenCreateTx.signWithSigner(signer)).sign(adminKey);

    console.log("about to send the transaction")

    let res = await tokenCreateTxSigned.executeWithSigner(signer);

    console.log("about to receive the transaction")

    // console.log(`- Created token with ID: ${tokenId} \n`);
    console.log(`- adminKey: ${adminKey}`);
    console.log(`- adminPublicKey: ${adminPublicKey}`);
    console.log(`- supplyKey: ${supplyKey}`);
    console.log(`- supplyPublicKey: ${supplyPublicKey}`);
    console.log(`- freezeKey: ${freezeKey}`);
    console.log(`- freezePublicKey: ${freezePublicKey}`);
    console.log(`- wipeKey: ${wipeKey}`);
    console.log(`- wipePublicKey: ${wipePublicKey}`);
    console.log(`- kycKey: ${kycKey}`);
    console.log(`- kycPublicKey: ${kycPublicKey}`);
    console.log(`- pauseKey: ${pauseKey}`);
    console.log(`- pausePublicKey: ${pausePublicKey}`);
    console.log(`- feeScheduleKey: ${feeScheduleKey}`);
    console.log(`- feeSchedulePublicKey: ${feeSchedulePublicKey}`);

}

export default TokenCreator