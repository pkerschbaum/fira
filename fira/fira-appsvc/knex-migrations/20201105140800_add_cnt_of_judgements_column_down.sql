ALTER TABLE "public"."judgement_pair" DROP COLUMN "cnt_of_judgements";

DROP TRIGGER judgement_gets_inserted ON "public"."judgement";
DROP TRIGGER judgement_gets_deleted ON "public"."judgement";

DROP FUNCTION inc_counter_on_judgement_insert();
DROP FUNCTION dec_counter_on_judgement_delete();
