
-- ROLES
CREATE TYPE public.app_role AS ENUM ('super_admin','store_manager','veterinarian','content_manager','order_manager','customer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  city text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','store_manager','veterinarian','content_manager','order_manager')
  )
$$;

CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  image_url text,
  pet_type text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER t_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  ingredients_ar text, ingredients_en text,
  benefits_ar text, benefits_en text,
  usage_ar text, usage_en text,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand text,
  pet_type text NOT NULL DEFAULT 'all',
  sku text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  discount_start timestamptz,
  discount_end timestamptz,
  stock int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  weight text,
  size text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_vet_pick boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published products" ON public.products FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_admin(auth.uid()));
CREATE POLICY "admin write products" ON public.products FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER t_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL, name_en text NOT NULL,
  description_ar text, description_en text,
  image_url text,
  price numeric(10,2),
  duration_min int,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write services" ON public.services FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('AW-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text, area text, address text, notes text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text NOT NULL DEFAULT 'cod',
  payment_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin orders update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin orders delete" ON public.orders FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE TRIGGER t_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name_ar text NOT NULL, name_en text NOT NULL,
  image_url text,
  unit_price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order items admin" ON public.order_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  pet_name text, pet_species text, pet_notes text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin appointments" ON public.appointments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER t_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PETS
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'dog',
  breed text, gender text, age text, weight text, photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT ALL ON public.pets TO service_role;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pets" ON public.pets FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id);

-- WISHLIST
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlist FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  comment text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read approved reviews" ON public.reviews FOR SELECT TO anon, authenticated
  USING (is_approved OR auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "insert own review" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- COUPONS
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percent',
  value numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  free_shipping boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read active coupons" ON public.coupons FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "admin coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL, title_en text NOT NULL,
  subtitle_ar text, subtitle_en text,
  image_url text, mobile_image_url text,
  cta_label_ar text, cta_label_en text, link text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read banners" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin banners" ON public.banners FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ARTICLES
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL, title_en text NOT NULL,
  excerpt_ar text, excerpt_en text,
  body_ar text, body_en text,
  cover_url text, author text, tags text[] NOT NULL DEFAULT '{}',
  seo_title text, seo_description text,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published articles" ON public.articles FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_admin(auth.uid()));
CREATE POLICY "admin articles" ON public.articles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text_ar text, text_en text,
  rating int NOT NULL DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- HOMEPAGE SECTIONS
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title_ar text, title_en text,
  subtitle_ar text, subtitle_en text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sections" ON public.homepage_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin sections" ON public.homepage_sections FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- SETTINGS
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- SEED
INSERT INTO public.categories (slug, name_ar, name_en, pet_type, sort_order) VALUES
 ('dog-food','طعام الكلاب','Dog Food','dog',1),
 ('cat-food','طعام القطط','Cat Food','cat',2),
 ('treats','المكافآت','Treats','all',3),
 ('medicines','الأدوية','Medicines','all',4),
 ('supplements','المكملات','Supplements','all',5),
 ('flea-tick','البراغيث والقراد','Flea & Tick','all',6),
 ('grooming','العناية والتجميل','Grooming','all',7),
 ('toys','الألعاب','Toys','all',8),
 ('accessories','الإكسسوارات','Accessories','all',9),
 ('dental-care','العناية بالأسنان','Dental Care','all',10),
 ('pet-hygiene','نظافة الحيوان','Pet Hygiene','all',11),
 ('pet-supplies','مستلزمات عامة','Pet Supplies','all',12);

INSERT INTO public.products (slug, name_ar, name_en, description_ar, description_en, category_id, brand, pet_type, sku, price, sale_price, stock, rating, review_count, is_featured, is_best_seller, is_new, is_vet_pick)
SELECT v.slug, v.name_ar, v.name_en, v.d_ar, v.d_en, c.id, v.brand, v.pet, v.sku, v.price, v.sale, v.stock, v.rating, v.rc, v.feat, v.best, v.isnew, v.vet
FROM (VALUES
 ('royal-canin-adult-dog','رويال كانين للكلاب البالغة','Royal Canin Adult Dog','طعام جاف متوازن للكلاب البالغة.','Balanced dry food for adult dogs.','dog-food','Royal Canin','dog','AW-1001',950.00,825.00,40,4.8,24,true,true,false,true),
 ('pedigree-chicken','بيدجري بالدجاج','Pedigree Chicken','طعام كلاب بالدجاج والخضروات.','Dog food with chicken and vegetables.','dog-food','Pedigree','dog','AW-1002',420.00,NULL,60,4.5,18,false,true,false,false),
 ('whiskas-tuna','ويسكاس تونة','Whiskas Tuna','طعام قطط جاف بنكهة التونة.','Dry cat food with tuna flavour.','cat-food','Whiskas','cat','AW-1003',380.00,320.00,55,4.6,31,true,true,false,false),
 ('felix-kitten','فيليكس للقطط الصغيرة','Felix Kitten','تغذية متكاملة للقطط الصغيرة.','Complete nutrition for kittens.','cat-food','Felix','cat','AW-1004',290.00,NULL,35,4.4,12,false,false,true,true),
 ('dental-chew-sticks','أصابع تنظيف الأسنان','Dental Chew Sticks','تنظف الأسنان وتحسن رائحة الفم.','Cleans teeth and freshens breath.','dental-care','PetDent','dog','AW-1005',180.00,150.00,80,4.7,20,true,false,false,true),
 ('flea-spot-on','قطرة مضادة للبراغيث','Flea Spot-On Treatment','حماية شهرية من البراغيث والقراد.','Monthly flea and tick protection.','flea-tick','VetGuard','all',  'AW-1006',260.00,NULL,45,4.9,40,true,true,false,true),
 ('omega3-supplement','مكمل أوميجا 3','Omega-3 Supplement','لفراء لامع ومفاصل صحية.','For a shiny coat and healthy joints.','supplements','VetLife','all','AW-1007',330.00,280.00,25,4.5,9,false,false,true,true),
 ('grooming-brush','فرشاة تنظيف الفراء','Grooming Brush','فرشاة لطيفة لإزالة الشعر المتساقط.','Gentle brush for shedding hair.','grooming','PetCare','all','AW-1008',150.00,NULL,70,4.3,15,false,false,false,false),
 ('rope-toy','لعبة الحبل','Rope Toy','لعبة متينة للعض واللعب.','Durable rope toy for chewing.','toys','PlayPet','dog','AW-1009',95.00,75.00,90,4.2,11,false,true,false,false),
 ('cat-litter-premium','رمل قطط ممتاز','Premium Cat Litter','امتصاص عالي وتحكم في الروائح.','High absorption and odour control.','pet-hygiene','CleanPaws','cat','AW-1010',210.00,NULL,50,4.6,22,true,true,false,false),
 ('adjustable-collar','طوق قابل للتعديل','Adjustable Collar','طوق مريح بمقاسات متعددة.','Comfortable collar in multiple sizes.','accessories','PetCare','all','AW-1011',120.00,NULL,65,4.1,7,false,false,true,false),
 ('vitamin-syrup','شراب فيتامينات','Vitamin Syrup','دعم يومي للمناعة والنشاط.','Daily immunity and energy support.','medicines','VetLife','all','AW-1012',185.00,160.00,30,4.7,17,false,false,false,true)
) AS v(slug,name_ar,name_en,d_ar,d_en,cat,brand,pet,sku,price,sale,stock,rating,rc,feat,best,isnew,vet)
JOIN public.categories c ON c.slug = v.cat;

INSERT INTO public.services (slug, name_ar, name_en, description_ar, description_en, price, duration_min, sort_order) VALUES
 ('checkup','كشف عام','General Checkup','فحص شامل لصحة حيوانك الأليف.','A complete health check for your pet.',200,30,1),
 ('vaccination','تطعيمات','Vaccinations','برنامج تطعيم كامل ومتابعة.','Full vaccination programme and follow-up.',250,20,2),
 ('grooming','قص وتنظيف','Grooming','قص شعر وتنظيف كامل.','Full grooming and cleaning session.',300,60,3),
 ('dental','العناية بالأسنان','Dental Care','تنظيف وعلاج مشاكل الأسنان.','Cleaning and dental treatment.',400,45,4),
 ('surgery','جراحة','Surgery','عمليات جراحية بإشراف متخصص.','Surgical procedures by specialists.',NULL,120,5),
 ('laboratory','تحاليل معملية','Laboratory','تحاليل دم وفحوصات دقيقة.','Blood tests and accurate diagnostics.',350,30,6),
 ('nutrition','استشارة تغذية','Nutrition Consultation','خطة غذائية مناسبة لحيوانك.','A tailored nutrition plan for your pet.',150,30,7),
 ('preventive','رعاية وقائية','Preventive Care','برنامج وقاية دوري.','Regular preventive care programme.',180,30,8);

INSERT INTO public.articles (slug, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, author) VALUES
 ('cat-nutrition-basics','أساسيات تغذية القطط','Cat Nutrition Basics','كيف تختار الطعام المناسب لقطتك.','How to choose the right food for your cat.','تحتاج القطط إلى بروتين حيواني عالي الجودة ومياه نظيفة دائمًا. اختر طعامًا مناسبًا لعمر القطة ووزنها، وتجنب الطعام البشري المالح أو الحار.','Cats need high-quality animal protein and constant access to clean water. Choose food suited to your cat''s age and weight, and avoid salty or spicy human food.','د. عالم الحيوان'),
 ('dog-vaccination-schedule','جدول تطعيمات الكلاب','Dog Vaccination Schedule','متى يحتاج كلبك كل تطعيم.','When your dog needs each vaccine.','يبدأ جدول التطعيمات من عمر 6 أسابيع ويستمر بجرعات داعمة سنوية. استشر الطبيب البيطري لتحديد الجدول المناسب.','Vaccinations start at 6 weeks of age and continue with yearly boosters. Consult your vet for the right schedule.','د. عالم الحيوان'),
 ('summer-pet-care','العناية بالحيوانات في الصيف','Summer Pet Care','نصائح لحماية حيوانك من الحر.','Tips to protect your pet from the heat.','وفّر ماءً باردًا دائمًا، وتجنب الخروج وقت الظهيرة، ولا تترك حيوانك داخل السيارة أبدًا.','Always provide cool water, avoid midday walks, and never leave your pet inside a car.','د. عالم الحيوان');

INSERT INTO public.testimonials (name, text_ar, text_en, rating, sort_order) VALUES
 ('منى ح.','خدمة ممتازة والدكتور شرح لي كل حاجة عن قطتي.','Excellent service, the vet explained everything about my cat.',5,1),
 ('أحمد ص.','المنتجات أصلية والتوصيل داخل المنيا كان سريع جدًا.','Genuine products and very fast delivery inside Minya.',5,2),
 ('سارة م.','أفضل مكان لمستلزمات الحيوانات في المنيا.','The best pet supplies shop in Minya.',5,3);

INSERT INTO public.homepage_sections (key, title_ar, title_en, sort_order) VALUES
 ('hero','الواجهة','Hero',1),
 ('categories','تسوق حسب الفئة','Shop by Category',2),
 ('pets','تسوق حسب الحيوان','Shop by Pet',3),
 ('best_sellers','الأكثر مبيعًا','Best Sellers',4),
 ('offers','عروض خاصة','Special Offers',5),
 ('vet_picks','اختيارات الطبيب','Vet''s Picks',6),
 ('vet_services','الخدمات البيطرية','Veterinary Services',7),
 ('why_us','لماذا نحن','Why Choose Us',8),
 ('reviews','آراء العملاء','Customer Reviews',9),
 ('articles','مقالات العناية','Pet Care Articles',10),
 ('newsletter','النشرة البريدية','Newsletter',11),
 ('location','موقعنا','Location',12);

INSERT INTO public.site_settings (key, value) VALUES
 ('general', '{"brand_ar":"عالم الحيوان","brand_en":"Animal World","tagline_ar":"كل ما يحتاجه حيوانك الأليف... في مكان واحد","tagline_en":"Everything Your Pet Needs, All in One Place.","currency":"EGP"}'::jsonb),
 ('contact', '{"phone":"+20 100 000 0000","whatsapp":"+20 100 000 0000","whatsapp_message_ar":"مرحبًا، أريد الاستفسار عن أحد المنتجات.","whatsapp_message_en":"Hello, I would like to ask about a product.","email":"info@animalworld.eg","address_ar":"المنيا، مصر","address_en":"Minya, Egypt","maps_url":"https://www.google.com/maps?q=Minya,+Egypt&output=embed","facebook":"","instagram":"","tiktok":""}'::jsonb),
 ('hours', '{"items":[{"day_ar":"السبت – الخميس","day_en":"Sat – Thu","time_ar":"10:00 ص – 10:00 م","time_en":"10:00 AM – 10:00 PM"},{"day_ar":"الجمعة","day_en":"Friday","time_ar":"2:00 م – 10:00 م","time_en":"2:00 PM – 10:00 PM"}]}'::jsonb),
 ('shipping', '{"fee":50,"free_over":1000,"delivery_time_ar":"خلال 24 ساعة داخل المنيا","delivery_time_en":"Within 24 hours inside Minya","min_order":0}'::jsonb),
 ('payments', '{"cod":true,"card":false,"online":false}'::jsonb),
 ('appointments', '{"slots":["10:00","11:00","12:00","13:00","16:00","17:00","18:00","19:00","20:00"],"closed_days":[5]}'::jsonb);
