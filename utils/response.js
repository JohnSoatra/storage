function response(res, status, reason) {
    res.status(status).send({
        'reason': reason
    });
}

module.exports = response;