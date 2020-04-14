export default async (req, res) => {
  console.log(req.query);
  await res.json(req.query);
  res.end();
};
