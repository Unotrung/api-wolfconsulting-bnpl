const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const FecController = {

    getHVToken: async (req, res, next) => {
        try {
            const url = process.env.BASE_URLHYPERVERGE;
            const options = {
                method: "POST",
                body: JSON.stringify({
                    appId: process.env.appId,
                    appKey: process.env.appKey,
                    expiry: 900
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                return res.status(200).json({
                    token: data.result.token,
                    status: true
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    registration: async (req, res, next) => {
        try {
            const url = `${process.env.BASE_URLFEC}/bnpl_api/2.0.3/m/Registration`;
            const options = {
                method: "POST",
                body: JSON.stringify({
                    BaseInfo: {
                        TransactionID: "2022-05-11T01:36:12.118+00:00",
                        ApplicationID: req.body.applicationID ? req.body.applicationID : "",
                        PartnerReferenceID: req.body.partnerReferenceID ? req.body.partnerReferenceID : "12345",
                        ExtraInfo: {
                            Email: req.body.email ? req.body.email : "",
                            UserCreditScore: req.body.userCreditScore ? req.body.userCreditScore : 0,
                            ExtendInfo: req.body.extendInfo ? req.body.extendInfo : {}
                        }
                    },
                    AppInfo: {
                        Product: {
                            ProductSchemeID: req.body.productSchemeID ? req.body.productSchemeID : "8620",
                        },
                        PersonalInfo: {
                            FullName: req.body.fullName,
                            FirstName: req.body.firstName,
                            MiddleName: req.body.middleName,
                            LastName: req.body.lastName,
                            Gender: req.body.gender,
                            DateOfBirth: req.body.dateOfBirth,
                            Nationality: req.body.nationality,
                            Occupation: req.body.occupation,
                            SocialStatusId: req.body.socialStatusId || "9",
                            JobTitle: req.body.jobTitle,
                            NationalIDs: [
                                {
                                    NationalID: req.body.nationalID,
                                    PlaceIssue: req.body.placeIssue,
                                    DateIssue: req.body.dateIssue,
                                    IsPrimary: req.body.isPrimary
                                }
                            ],
                            Contacts: {
                                Phones: {
                                    Phone: [
                                        {
                                            PhoneType: req.body.phoneType,
                                            PhoneNumber: req.body.phone,
                                            IsPrimaryPhone: req.body.isPrimaryPhone
                                        }
                                    ]
                                },
                                Addresses: {
                                    Address: [
                                        {
                                            Type: req.body.type,
                                            HouseType: req.body.houseType,
                                            Country: req.body.country,
                                            City: req.body.city,
                                            District: req.body.district,
                                            Ward: req.body.ward,
                                            Street_Hamlet: req.body.streetHamlet,
                                            BuildingName: req.body.buildingName,
                                            HouseNumber: req.body.houseNumber,
                                            ApartmentNumber: req.body.apartmentNumber,
                                            StayDurationMonths: req.body.stayDurationMonths,
                                            StayDurationYears: req.body.stayDurationYears
                                        }
                                    ]
                                }
                            },
                            Documents: [
                                {
                                    DocTypeId: 'Selfie',
                                    DocName: req.body.docNameSelfie,
                                    DocContent: req.body.docNameSelfieContent
                                },
                                {
                                    DocTypeId: 'NationalID_F',
                                    DocName: req.body.docNameNationalIDF,
                                    DocContent: req.body.docNameNationalIDFContent
                                },
                                {
                                    DocTypeId: 'NationalID_B',
                                    DocName: req.body.docNameNationalIDB,
                                    DocContent: req.body.docNameNationalIDBContent
                                }
                            ]
                        },
                        ReferencePersons: {
                            ReferencePerson: [
                                {
                                    FullName: req.body.fullNameRef,
                                    ReferenceRelation: req.body.referenceRelation,
                                    Phones: {
                                        Phone: [
                                            {
                                                PhoneType: req.body.phoneType,
                                                PhoneNumber: req.body.phoneRef
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        IncomeAndExp: {
                            CustMonthlyNetIncome: 3000000
                        }
                    }
                }),
                headers: {
                    "Content-Type": "application/json",
                    "TransID": process.env.TRANSID,
                    "RequestorID": process.env.REQUESTORID,
                    "DateTime": "2022-05-11T01:36:12.118+00:00",
                    "ms2-authorization": req.headers.ms2authorization
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                console.log("DATA REGISTRATION: ", data);
                return res.status(200).json({
                    data: data
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkBNPLInfo: async (req, res, next) => {
        try {
            const url = `${process.env.BASE_URLFEC}/bnpl_api/2.0.3/m/Check`;
            const options = {
                method: "POST",
                body: JSON.stringify({
                    TransactionID: process.env.TRANSID,
                    NationalID: req.body.nid,
                    PhoneNumber: req.body.phone,
                    DocumentInfo: [
                        {
                            FileKey: 'Selfie',
                            FileContent: 'image/jpeg',
                            FileName: req.body.filename,
                            FileBody: '<Base64File=Encoding>'
                        }
                    ]
                }),
                headers: {
                    "Content-Type": "application/json",
                    "TransID": process.env.TRANSID,
                    "RequestorID": process.env.REQUESTORID,
                    "DateTime": "2022-05-11T01:36:12.118+00:00",
                    "ms2-authorization": req.headers.ms2authorization
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                console.log("DATA CHECK BNPL INFO: ", data);
                return res.status(200).json({
                    data: data
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkAccountInfo: async (req, res, next) => {
        try {
            const url = `${process.env.BASE_URLFEC}/bnpl_getaccountinfo/1.0.1/m/CheckAccountInfo`;
            const options = {
                method: "POST",
                body: JSON.stringify({
                    AccountNumber: req.body.accountNumber
                }),
                headers: {
                    "Content-Type": "application/json",
                    "TransID": process.env.TRANSID,
                    "RequestorID": process.env.REQUESTORID,
                    "DateTime": "2022-05-11T01:36:12.118+00:00",
                    "ms2-authorization": req.headers.ms2authorization
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                console.log("DATA CHECK ACCOUNT INFO: ", data);
                return res.status(200).json({
                    data: data
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkEMIInfo: async (req, res, next) => {
        try {
            const url = `${process.env.BASE_URLFEC}/bnpl_checkout/1.0.2/m/Checkout_CheckEMIInfo?TransactionID=${req.query.transactionID}&AccountNumber=${req.query.accountNumber}&TotalOfferAmount=${req.query.totalOfferAmount}`;
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "TransID": process.env.TRANSID,
                    "RequestorID": process.env.REQUESTORID,
                    "DateTime": "2022-05-11T01:36:12.118+00:00",
                    "ms2-authorization": req.headers.ms2authorization
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                console.log("DATA CHECK EMMI INFO: ", data);
                return res.status(200).json({
                    data: data
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkoutTransaction: async (req, res, next) => {
        try {
            const url = `${process.env.BASE_URLFEC}/bnpl_checkout/1.0.2/m/Checkout_Transaction`;
            const options = {
                method: "POST",
                body: JSON.stringify({
                    TransactionID: process.env.TRANSID,
                    AccountNumber: req.body.accountNumber,
                    CustomerInfo: {
                        CustomerName: req.body.customerName,
                        NationalID: req.body.nid,
                        PhoneNumber: req.body.phone
                    },
                    ItemList: [
                        {
                            Name: 'Sản phẩm 1',
                            Quantity: 2,
                            Price: 2000000
                        }
                    ]
                }),
                headers: {
                    "Content-Type": "application/json",
                    "TransID": process.env.TRANSID,
                    "RequestorID": process.env.REQUESTORID,
                    "DateTime": "2022-05-11T01:36:12.118+00:00",
                    "ms2-authorization": req.headers.ms2authorization
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                console.log("DATA CHECK OUT TRANSACTION INFO: ", data);
                return res.status(200).json({
                    data: data
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = FecController;