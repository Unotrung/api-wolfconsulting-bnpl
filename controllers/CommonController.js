const Tenor = require('../models/tenors');
const Customer = require('../models/bnpl_customers');
const City = require('../models/cities');
const District = require('../models/districts');
const Ward = require('../models/wards');
const ReferenceRelation = require('../models/reference_relations');
const { MSG_GET_LIST_SUCCESS, MSG_LIST_IS_EMPTY } = require('../config/response/response');

const CommonController = {

    getAllTenor: async (req, res, next) => {
        try {
            const tenors = await Tenor.find().select('_id convertFee paymentSchedule createdAt updatedAt');
            if (tenors.length > 0) {
                return res.status(200).json({
                    count: tenors.length,
                    data: tenors,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllCity: async (req, res, next) => {
        try {
            const cities = await City.find();
            if (cities.length > 0) {
                return res.status(200).json({
                    count: cities.length,
                    data: cities,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllDistrict: async (req, res, next) => {
        try {
            const districts = await District.find();
            if (districts.length > 0) {
                return res.status(200).json({
                    count: districts.length,
                    data: districts,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllWard: async (req, res, next) => {
        try {
            const wards = await Ward.find();
            if (wards.length > 0) {
                return res.status(200).json({
                    count: wards.length,
                    data: wards,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllReferenceRelation: async (req, res, next) => {
        try {
            const referenceRelations = await ReferenceRelation.find();
            if (referenceRelations.length > 0) {
                return res.status(200).json({
                    count: referenceRelations.length,
                    data: referenceRelations,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getDistrict: async (req, res, next) => {
        try {
            const districts = await District.find({ Parent_Value: req.body.idParent });
            if (districts.length > 0) {
                return res.status(200).json({
                    count: districts.length,
                    data: districts,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getWard: async (req, res, next) => {
        try {
            const wards = await Ward.find({ Parent_Value: req.body.idParent });
            if (wards.length > 0) {
                return res.status(200).json({
                    count: wards.length,
                    data: wards,
                    message: MSG_GET_LIST_SUCCESS,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: MSG_LIST_IS_EMPTY,
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateStep: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let step = req.body.process;
            if (phone !== null && phone !== '' && step !== null && step !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.phone === phone);
                if (step === 0) {
                    customer.step = 0
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc failure)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc failure)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 1) {
                    customer.step = 1
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Not exists)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Not exists)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 2) {
                    customer.step = 2
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Registered success)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Registered fail)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 3) {
                    customer.step = 3
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc process)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc process)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 4) {
                    customer.step = 4
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc completed)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc completed)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(400).json({
                        message: 'Step is not valid',
                        status: false,
                        statusCode: 4000
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: 'Please enter all fields ! Do not leave any field blank !',
                    status: false,
                    statusCode: 1005
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = CommonController;