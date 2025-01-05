export const PRODUCT_DB = {
  type: 'postgres',
  url: 'postgresql://postgres:Qkrgusals12%21@db.hnfcmdvepwcpcxxwavim.supabase.co:5432/postgres',
};

export const DEVELOPER_DB = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
