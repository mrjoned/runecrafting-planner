const BASE = "appKeSJ1RKvjR431H";
const TABLE = "tbleGljVKwiwRFhLO";
const F = {
  name:"fldFrDVQFVODzW7zo",
  runes:["fld1idvmy0kUW2oUV","fldz1Gm9MifsLZsIa","fldDaZSNNUvVUgrhq","fld90i6loqAi3JxYS","fldWJWCf86afxSWLE"],
  items:"fld1zZu069Av26oCg", level:"fldqT9AzIOrOmyBfA",
  incompatibleRunes:"fldqE6EdCI9tqXIb4", incompatibleVanilla:"fldULFbYjEg4e0TTt",
  description:"fldZXMPT3Wefb8aFX", source:"fldGoiDwJVKCrI6Cd",
  category:"fld0R5eh77v8Ez3I7"
};
const val = x => typeof x === "string" ? x : x && typeof x === "object" ? (x.name || "") : "";
const arr = x => Array.isArray(x) ? x.map(val).filter(Boolean) : [];
const roman = /\s+[IVXLCDM]+$/;
const cache = { at:0, body:null };
exports.handler = async () => {
  if (!process.env.AIRTABLE_TOKEN) return {statusCode:503,body:JSON.stringify({error:"Airtable token not configured"})};
  if (cache.body && Date.now()-cache.at < 300000) return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=120"},body:cache.body};
  try {
    let offset, rows=[], pages=0;
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
      url.searchParams.set("pageSize","100");
      url.searchParams.set("returnFieldsByFieldId","true");
      if (offset) url.searchParams.set("offset",offset);
      const res=await fetch(url,{headers:{Authorization:`Bearer ${process.env.AIRTABLE_TOKEN}`}});
      if(!res.ok) throw Error(`Airtable returned ${res.status}`);
      const data=await res.json();
      rows.push(...(data.records||[]));
      offset=data.offset;
      pages++;
    } while(offset && pages<20);
    if(offset) throw Error("Too many pages");
    const enchantments=rows.map(({fields:x={}})=>{
      const name=val(x[F.name]).trim(), source=val(x[F.source]);
      const runes=F.runes.map(id=>val(x[id])).filter(Boolean);
      const free=["Mythical","Vanilla","Curse"].includes(source);
      const fixed=roman.test(name);
      return {
        name, runes, items:arr(x[F.items]),
        maxLevel:source==="Mythical" ? null : fixed ? 1 : (Number(val(x[F.level]))||1),
        incompatible:[...new Set([...arr(x[F.incompatibleRunes]),...arr(x[F.incompatibleVanilla])])],
        description:val(x[F.description]),source,category:val(x[F.category])||"Uncategorized",
        costMode:free?"free":"runes"
      };
    }).filter(e=>e.name && e.items.length && (e.costMode==="free" || e.runes.length===5))
      .sort((a,b)=>a.name.localeCompare(b.name));
    const items=[...new Set(enchantments.flatMap(e=>e.items))].sort();
    const body=JSON.stringify({enchantments,items});
    cache.at=Date.now();cache.body=body;
    return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=120"},body};
  } catch(e) {
    console.error("Airtable load failed",e.message);
    return {statusCode:502,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"Unable to load Airtable enchantments"})};
  }
};
