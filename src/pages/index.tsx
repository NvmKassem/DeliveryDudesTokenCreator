    import {Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper, Tooltip} from '@material-ui/core';
    import {Field, Form, Formik, FormikConfig, FormikValues, useFormikContext} from 'formik';
    import {CheckboxWithLabel, TextField} from 'formik-material-ui';
    import React, {useState} from 'react';
    import Image from 'next/image'
    import {HashConnect, HashConnectTypes} from 'hashconnect';
    import TokenCreator from '../token_creator/tokenCreator';
    import MuiTextField from '@mui/material/TextField';
    import logo from "../images/delivery-dudes-logo.png"


    const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

    const hashConnect = new HashConnect(true);

    export default function Home() {

        const [walletConnected, setWalletConnected] = useState(false);
        const [accountId, setAccountId] = useState('');
        const [topic, setTopic] = useState<string>('');
        const [feeArr, setFeeArr] = useState<any>([]);

        const connectToWallet = async () => {

            let appData: HashConnectTypes.AppMetadata = {
                name: "DeliveryDudes Token Creator",
                description: "Automatic token creation tool for Hedera",
                icon: "https://absolute.url/to/icon.png" // TODO: Add icon
            }

            let initData = await hashConnect.init(appData, "testnet");
            let privateKey = initData.encryptionKey;

            console.log(privateKey + ' is your private key');

            let state = await hashConnect.connect();
            setTopic(state);

            let paringString = hashConnect.generatePairingString(state, 'testnet', false);

            hashConnect.findLocalWallets();
            hashConnect.connectToLocalWallet();

            hashConnect.pairingEvent.once((pairingData) => {
                setAccountId(pairingData.accountIds[0]);
                setWalletConnected(true);
            });
        }


        function renderCustomFees() {
            const feeTypes = [
                {
                    value: 'fractional',
                    label: '%',
                },
                {
                    value: 'fixed',
                    label: 'Hbar',
                }
            ];

            console.log(feeArr)
            return feeArr.map((fee, index) => {
                return (
                    <Grid item xs={12} key={index}>
                        <Grid item xs={7}>
                            <MuiTextField
                                id={`fee-address-${index}`}
                                label={`AccountId ${index + 1}`}
                                value={fee.address}
                                onChange={(e) => {setFeeArr(feeArr.map(el => (el.id === fee.id ? {...el, address: e.target.value} : el)))}}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <MuiTextField
                                id={`fee-fee-${index}`}
                                type="number"
                                label={`Fee ${index + 1}`}
                                value={fee.fee}
                                onChange={(e) => {setFeeArr(feeArr.map(el => (el.id === fee.id ? {...el, fee: e.target.value} : el)))}}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <MuiTextField
                                id="standard-select-currency"
                                select
                                // label="Fee Type"
                                value={fee.feeType}
                                onChange={(e) => {setFeeArr(feeArr.map(el => (el.id === fee.id ? {...el, feeType: e.target.value} : el)))}}
                                SelectProps={{
                                    native: true,
                                }}
                                // helperText=""
                                variant="standard"
                            >
                                {feeTypes.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </MuiTextField>
                        </Grid>
                        <Grid item xs={1}>
                            <Button onClick={() => {setFeeArr((arr) => arr.filter((e) => e.id !== fee.id))}}>Delete</Button>
                        </Grid>
                    </Grid>
                )
            })
        }

        // Some field validations
        const validateTokenName = value => {
            let errorMessage;
            if (value.length > 5) {
                errorMessage = 'Token Name must be 100 characters or less';
            }
            if (value === '') {
                errorMessage = 'Field is empty';
            }
            return errorMessage;
        };

        const validateTokenSymbol = value => {
            let errorMessage;
            if (value.length > 5) {
                errorMessage = 'Token Symbol must be 100 characters or less';
            }
            if (value === '') {
                errorMessage = 'Field is empty';
            }
            return errorMessage;
        }

        const validateInitialSupply = value => {
            let errorMessage;
            console.log(value)
            if (value == undefined) {
                return 'Field is empty';
            }
            try {
                // @ts-ignore
                if (BigInt(value) > 9223372036854775807n) {
                    errorMessage = 'Supply must be of 9,223,372,036,854,775,807 (2^63-1) or less';
                }
            } catch (e) {
                errorMessage = 'Field is empty';
            }

            return errorMessage;
        }

        const validateMaxSupply = value => {
            let errorMessage;
            console.log(value)
            if (value == undefined) {
                return 'Field is empty';
            }
            try {
                // @ts-ignore
                if (BigInt(value) > 9223372036854775807n) {
                    errorMessage = 'Supply must be of 9,223,372,036,854,775,807 (2^63-1) or less';
                }
            } catch (e) {
                errorMessage = 'Field is empty';
            }

            return errorMessage;
        }


        const validateMemo = value => {
            let errorMessage;
            if (value.length > 5) {
                errorMessage = 'Memo must be 100 characters or less';
            }
            if (value === '') {
                errorMessage = 'Field is empty';
            }
            return errorMessage;
        }

        return (
            <>
                {!walletConnected ?
                    <div className="signInContainer">
                        <Box paddingBottom={2} className="connectWallet">
                            <h1>Sign In to Your Wallet</h1>
                            <p>Please connect to your HashPack wallet.</p>
                            <button onClick={connectToWallet}>Connect Wallet</button>
                        </Box>
                    </div>
                    :
                    <Card>
                        <a className="needHelp" target="_blank" href="https://docs.hedera.com/guides/docs/sdks/tokens/define-a-token">
                            <h4>Need help?</h4>
                        </a>

                        <div className="delivery-dudes-logo">
                            <a target="_blank" href="https://delivery-dudes.io/">
                                <Image src={logo} alt="logo" width="60px" height="80px"/>
                            </a>
                        </div>

                        <CardContent>
                            <FormikStepper
                                feeArr={feeArr}
                                account={accountId}
                                initialValues={{
                                    tokenName: '',
                                    tokenSymbol: '',
                                    supplyType: 'INFINITE',
                                    memo: '',
                                }}
                                onSubmit={async (values) => {
                                    await sleep(3000);
                                    console.log('values', values);
                                    TokenCreator(values, topic, hashConnect, accountId, feeArr);
                                }}
                            >

                                <FormikStep label="Token Info">
                                    <Box paddingBottom={2}>
                                        <Tooltip title="Name of your token" placement="right-start">
                                            <Field fullWidth className="tooltip" validate={validateTokenName} name="tokenName" component={TextField} label="Token Name"> </Field>
                                        </Tooltip>
                                    </Box>

                                    <Box paddingBottom={2}>
                                        <Tooltip title="Symbol of your token" placement="right-start">
                                            <Field fullWidth name="tokenSymbol" validate={validateTokenSymbol} component={TextField} label="Token Symbol"/>
                                        </Tooltip>
                                    </Box>
                                </FormikStep>

                                <FormikStep label="Supply Data">
                                    <Box paddingBottom={2}>
                                        <Tooltip title="Number of tokens sent to the treasury" placement="right">
                                            <Field fullWidth name="initialSupply" validate={validateInitialSupply} component={TextField} type={'number'} label="Initial Supply"/>
                                        </Tooltip>
                                    </Box>
                                    <Box paddingBottom={2}>
                                        <Tooltip title="Max number of tokens in circulation" placement="right">
                                            <Field fullWidth name="maxSupply" validate={validateMaxSupply} component={TextField} type={'number'} label="Max Supply"/>
                                        </Tooltip>
                                    </Box>
                                    <Box paddingBottom={2}>
                                        <Tooltip title="number of decimal places divisible by" placement="right">
                                            <Field fullWidth name="decimal" component={TextField} type={'number'} label="Decimal"/>
                                        </Tooltip>
                                    </Box>
                                </FormikStep>

                                <FormikStep label="Custom Fees">
                                    <Box paddingBottom={2}>
                                            {renderCustomFees()}
                                            {feeArr.length < 10 ?
                                                <div className='fullPageLength'>
                                                    <Button id='addNewFeeButton' onClick={() => setFeeArr((p) => [...p, {
                                                        id: Date.now(),
                                                        address: '',
                                                        fee: '',
                                                        feeType: 'fractional'
                                                    }])}>Add new Fee</Button>
                                                </div>
                                                : null}

                                    </Box>
                                </FormikStep>

                                <FormikStep label="Additional Data">
                                    <Box paddingBottom={2}>
                                        <Tooltip title="Epoch second at which the token expires" placement="right">
                                            <Field fullWidth name="expirationTime" component={TextField}
                                                   label="Expiration Time"/>
                                        </Tooltip>
                                    </Box>
                                    <Box paddingBottom={2}>
                                        <Tooltip title="Publicly visible memo about the token" placement="right">
                                            <Field fullWidth name="memo" component={TextField} validate={validateMemo} label="Memo"/>
                                        </Tooltip>
                                    </Box>
                                </FormikStep>

                            </FormikStepper>

                        </CardContent>
                    </Card>
                }
            </>

        );
    }

    export interface FormikStepProps
        extends Pick<FormikConfig<FormikValues>, 'children' | 'validationSchema'> {
        label: string;
    }

    export interface FormikStepperProps extends FormikConfig<FormikValues> {
        account: string;
        feeArr: any;
    }

    export function FormikStep({children}: FormikStepProps) {
        return <>{children}</>;
    }



    export function FormikStepper({children, ...props}: FormikStepperProps) {
        const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
        const [step, setStep] = useState(0);
        const currentChild = childrenArray[step];
        const [completed, setCompleted] = useState(false);

        function isReviewStep() {
            return step === childrenArray.length;
        }

        function review(values) {
            function renderFeesList() {
                console.log(props.feeArr)
                let feeElementsArr = [];
                if(props.feeArr.length==0)
                    return <p><em>None</em></p>
                for(let i = 0; i < props.feeArr.length; i++) {
                    if (props.feeArr[i].feeType == "fractional")
                        feeElementsArr[i] = (<p>{props.feeArr[i].address} ({props.feeArr[i].fee}%)</p>)
                    else if(props.feeArr[i].feeType == "fixed")
                        feeElementsArr[i] = (<p>{props.feeArr[i].address} ({props.feeArr[i].fee} Hbar)</p>)
                }
                return feeElementsArr;
            }

            return (
                <FormikStep label="Review">
                    <Box paddingBottom={2}>
                        <div className="row">
                            <div className="column">
                                <h3 style={{color:'#01c38d'}}>Token Info</h3>
                                <p>Token Name: {values.tokenName}</p>
                                <p>Token Symbol: {values.tokenSymbol}</p>
                            </div>
                            <div className="column">
                                {/*<br/>*/}
                                <h3 style={{color:'#01c38d'}}>Supply Data</h3>
                                <p>Initial Supply: {values.initialSupply}</p>
                                <p>Max Supply: {values.maxSupply}</p>
                                <p>Decimal: {values.decimal}</p>
                            </div>
                            <div className="column">
                                <h3 style={{color:'#01c38d'}}>Custom Fee</h3>
                                {renderFeesList()}

                            </div>
                            <div className="column">
                                <h3 style={{color:'#01c38d'}}>Additional Data</h3>
                                <p>Account Id: {props.account}</p>
                                <p>Expiration Time: {values.expirationTime}</p>
                                <p>Memo: {values.memo}</p>
                            </div>
                        </div>

                    </Box>
                </FormikStep>
            )
        }

        return (
            <Formik
                {...props}
                validationSchema={isReviewStep() ? null : currentChild.props.validationSchema}
                onSubmit={async (values, helpers) => {
                    if (isReviewStep()) {
                        await props.onSubmit(values, helpers);
                        setCompleted(true);
                    } else {
                        setStep((s) => s + 1);
                        helpers.setTouched({});
                    }
                }}
            >
                {({isSubmitting, values}) => (
                    <Form autoComplete="off">
                        <Stepper alternativeLabel activeStep={step}>
                            {childrenArray.map((child, index) => (
                                <Step key={child.props.label} completed={step > index || completed}>
                                    <StepLabel>{child.props.label}</StepLabel>
                                </Step>
                            ))}
                            <Step key={"Review"} completed={step > childrenArray.length || completed}>
                                <StepLabel>Review</StepLabel>
                            </Step>
                        </Stepper>

                        {isReviewStep() ? review(values) : currentChild}

                        <Grid container spacing={2}>
                            {step > 0 ? (
                                <Grid item>
                                    <Button
                                        disabled={isSubmitting}
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setStep((s) => s - 1)}
                                    >
                                        Back
                                    </Button>
                                </Grid>
                            ) : null}
                            <Grid item>
                                <Button
                                    startIcon={isSubmitting ? <CircularProgress size="1rem"/> : null}
                                    disabled={isSubmitting}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    {isSubmitting ? 'Submitting' : isReviewStep() ? 'Submit' : 'Next'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        );
    }
