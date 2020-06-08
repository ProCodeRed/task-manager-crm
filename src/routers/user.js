const express = require('express')
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')
const multer = require('multer'); // to upload files
const sharp = require('sharp') // to manage the files size and convertion of format
const router = new express.Router();


//signUp route
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name) // for mails sending
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})


// signIn route
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})


//logout route using specific token session
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logout from all toekns sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// router.get('/users', auth, async (req, res) => {
//     try{

//         const users = await User.find({});
//         res.send(users);

//     } catch (e) {
//         res.status(500).send(e);
//     }
// }) // to fetch many users

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
}) // only profile ppl can see what they have



router.get('/users/:id', async (req, res) => {

    const _id = req.params.id;

    try {
        const user = await User.findById(_id);
        if( !user ) {
            return res.status(404).send();
        }
        res.send(user)

    } catch(e) {
        return res.status(500).send(e);
    }
})// fetching specific user info


//updating the users details
// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body); // converting req object into an array here
//     const allowedUpdates = ['name', 'email', 'password', 'age']; // only properties that will be allowed to be updated
//     const isValidOperation = updates.every((update) => {
//         return allowedUpdates.includes(update)
//     })
//     if(!isValidOperation){
//         return res.status(400).send({error: 'Invalid Opertion'})
//     }
     
//     try{
//         const user = await User.findById(req.params.id);
//         updates.forEach((update) => {
//             user[update] = req.body[update];
//         })
//         await user.save();
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new :true, runValidators : true});
//         if(!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e) {
//         res.status(404).send(e)
//     }
// })


// this code responsile for only user can update his data and profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body); // converting req object into an array here
    const allowedUpdates = ['name', 'email', 'password', 'age']; // only properties that will be allowed to be updated
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.delete('/users/:id', async (req, res) => {
//     try{
//         const user = await User.findByIdAndDelete(req.params.id);
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e) {
//         res.send(500).send()
//     }
// })

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name) //for sending goodbye email
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//validation logics for user profile pic upload
const upload = multer({
    limits: {
        fileSize: 1000000 //1mb
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Please upload an image'))
        }

        callback(undefined, true);
    }
})
router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},  (err, req, res, next) => {
    res.status(400).send({ error: err.message})
})

// deleting the upload profile
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//fetching avatar
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png') //setting header
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send()
    }
})

module.exports = router;