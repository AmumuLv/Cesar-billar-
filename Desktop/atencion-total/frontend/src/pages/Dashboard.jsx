
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard(){
 const [data,setData]=useState([])
 const [name,setName]=useState('')

 const load=async()=>{
  const res=await axios.get('http://localhost:3000/api/contacts')
  setData(res.data)
 }

 useEffect(()=>{load()},[])

 const add=async()=>{
  await axios.post('http://localhost:3000/api/contacts',{name})
  load()
 }

 return (
  <div className="p-6">
   <input onChange={e=>setName(e.target.value)} className="border p-2 mr-2"/>
   <button onClick={add} className="bg-blue-600 text-white px-4 py-2">Agregar</button>

   <table className="w-full mt-4 border">
    <tbody>
     {data.map(d=>(
      <tr key={d._id}>
        <td className="border p-2">{d.name}</td>
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 )
}
