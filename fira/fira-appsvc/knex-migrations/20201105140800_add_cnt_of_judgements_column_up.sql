ALTER TABLE "public"."judgement_pair"
ADD COLUMN "cnt_of_judgements" integer NOT NULL DEFAULT 0;

/* compute column value for existing judgements */
UPDATE "public"."judgement_pair"
SET "cnt_of_judgements" = (
	SELECT count(*) FROM "public"."judgement"
	WHERE
		"public"."judgement_pair"."document_id" = "public"."judgement"."document_document"
		AND "public"."judgement_pair"."query_id" = "public"."judgement"."query_query"
);
	
/* create triggers to update the cnt_of_judgements if judgements get inserted/deleted */
CREATE FUNCTION inc_counter_on_judgement_insert()
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
BEGIN
	UPDATE "public"."judgement_pair" SET "cnt_of_judgements" = "cnt_of_judgements" + 1
	WHERE
			"public"."judgement_pair"."document_id" = NEW."document_document"
			AND "public"."judgement_pair"."query_id" = NEW."query_query";
	RETURN NEW;
END;
$$;

CREATE FUNCTION dec_counter_on_judgement_delete()
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
BEGIN
	UPDATE "public"."judgement_pair" SET "cnt_of_judgements" = "cnt_of_judgements" - 1
	WHERE
			"public"."judgement_pair"."document_id" = OLD."document_document"
			AND "public"."judgement_pair"."query_id" = OLD."query_query";
	RETURN OLD;
END;
$$;

CREATE TRIGGER judgement_gets_inserted
	AFTER INSERT
	ON "public"."judgement"
	FOR EACH ROW
	EXECUTE PROCEDURE inc_counter_on_judgement_insert();

CREATE TRIGGER judgement_gets_deleted
	AFTER DELETE
	ON "public"."judgement"
	FOR EACH ROW
	EXECUTE PROCEDURE dec_counter_on_judgement_delete();
