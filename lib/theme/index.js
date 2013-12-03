var util = require('util');
var request = require("request");

module.exports = (function (auth) {
    var linkTag = '<link rel="stylesheet" type="text/css" href="%s"/>';
    var greenTheme = "/css/green-theme.css";
    var redTheme = "/css/red-theme.css";

    var getCompany = function (user, cb) {
        request({
            url: "http://userprofile.landingpage-ci.dspdev.wmg.com/api/v1/userprofile/",
            method: "GET",
            json: true,
            qs: {
                filter: user.email
            },
            headers: {
                "Authorization": "Bearer " + user.accessToken
            }
        }, cb);
    }

    return function (req, res, next) {
        var currentTheme = null, company = null;

        if (req.user) {
            if (!req.session.userProfile) {
                getCompany(req.user, getCompanyCb);
            } else {
                getTheme(req.session.userProfile.company);
            }
        } else {
            getTheme(null);
        }

        function getCompanyCb (error, response, body) {
            var userProfile;

            if (error) {
                throw error;
            } else {
                if (body.data.length) {
                    userProfile = body.data[0];

                    req.session.userProfile = userProfile;

                    getTheme(userProfile.company)
                }
            }
        }

        function getTheme (company) {
            switch (company) {
                case "Warner Music Group":
                    currentTheme = greenTheme;
                    break;
                case "Some another company":
                    currentTheme = redTheme;
                    break;
            }

            res.locals({
                theme_raw_tag: currentTheme ? util.format(linkTag, currentTheme): "",
                theme_url: currentTheme ? currentTheme : ""
            });

            next();
        }
    }
})();
