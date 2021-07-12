const admin = require('firebase-admin')
const credentials = require('../credentials.json')

function connectDb() {
    if(!admin.apps.length){
        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        })
    }
    return admin.firestore()
}

exports.getCustomers = (request, response) => {
    const db = connectDb()
    db.collection('customers').get()
        .then(customerCollection => {
            const allCustomers = customerCollection.docs.map(doc => doc.data())
            response.send(allCustomers)
        })
        .catch(err => {
            console.error(err)
            response.status(500).send(err)
        })
}

exports.getCustomerById = (request, response) => {
    if(!request.params.customerId) {
        response.status(400).send('Bad request')
        return
    }
    const db = connectDb()
    db.collection('customers').doc(request.params.customerId).get()
        .then(custDoc => {
            let customer = custDoc.data()
            customer.id = custDoc.id
            response.send(customer)
        })
        .catch(err => {
            console.error(err)
            response.status(500).send(err)
        })
}


exports.getCustomerByQuery = (req, res) => {
    // get query from req.query
    const { fname } = req.query
    // connect to firestore
    const db = connectDb()
    // search customers collection based on query
    db.collection('customers').where('firstName', '==', fname).get()
        // respond with results
        .then(customerCollection => {
            const matches = customerCollection.docs.map(doc => {
                let customer = doc.data()
                customer.id = doc.id
                return customer
            })
            res.send(matches)
        })
        .catch(err => res.status(500).send(err))
}