
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY "public read published products" ON public.products;
CREATE POLICY "anon read published products" ON public.products FOR SELECT TO anon USING (is_published);
CREATE POLICY "auth read products" ON public.products FOR SELECT TO authenticated USING (is_published OR public.is_admin(auth.uid()));

DROP POLICY "read published articles" ON public.articles;
CREATE POLICY "anon read articles" ON public.articles FOR SELECT TO anon USING (is_published);
CREATE POLICY "auth read articles" ON public.articles FOR SELECT TO authenticated USING (is_published OR public.is_admin(auth.uid()));

DROP POLICY "read approved reviews" ON public.reviews;
CREATE POLICY "anon read reviews" ON public.reviews FOR SELECT TO anon USING (is_approved);
CREATE POLICY "auth read reviews" ON public.reviews FOR SELECT TO authenticated
  USING (is_approved OR auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY "read active coupons" ON public.coupons;
CREATE POLICY "anon read coupons" ON public.coupons FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read coupons" ON public.coupons FOR SELECT TO authenticated
  USING (is_active OR public.is_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
