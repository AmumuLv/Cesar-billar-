
const router = require('express').Router();
const Contact = require('../models/Contact');

router.get('/', async (req,res)=> res.json(await Contact.find()));
router.post('/', async (req,res)=>{
 const c = new Contact(req.body);
 await c.save();
 res.status(201).json(c);
});
router.put('/:id', async (req,res)=>{
 res.json(await Contact.findByIdAndUpdate(req.params.id, req.body,{new:true}));
});
router.delete('/:id', async (req,res)=>{
 await Contact.findByIdAndDelete(req.params.id);
 res.json({msg:'ok'});
});

module.exports = router;
