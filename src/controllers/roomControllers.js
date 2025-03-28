const path = require('path');
exports.getLandingPage = (req,res) => {
	res.sendFile(path.join(__dirname,'..','..','views', 'index.html'));
}
