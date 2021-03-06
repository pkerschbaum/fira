select * from document where id = 'D1128958_7';
delete from judgement_pair;
delete from query_version; delete from document_version;
delete from query; delete from document;
delete from judgement;
delete from judgement where status = 'TO_JUDGE' and user_id = 'user02';
delete from feedback;

select * from config;
select * from document;
select * from query;
select * from document_version;
select * from query_version;
select * from judgement_pair;
select * from judgement order by created_at, id;
select * from judgement where user_id = 'user01' order by created_at, id;
select * from judgement where status = 'TO_JUDGE' order by created_at, id;
select * from feedback;

delete from judgement where id=67;

-- query#01: notPreloaded
explain select jp.document_id, jp.query_id from judgement_pair jp
where not exists(
	select 1 from judgement j
	where j.document_document = jp.document_id AND j.query_query = jp.query_id AND j.user_id = 'user01'
)

-- query#02: jp with prio all
explain select j.* from judgement j
left join judgement_pair jp on jp.document_id = j.document_document and jp.query_id = j.query_query
where jp.priority = 'all';

-- query#03: candidates
select jp.document_id, jp.query_id, jp.priority, jp.cnt_of_judgements / 2 target_reached_n_times
from judgement_pair jp
where jp.priority <> 'all' and (jp.document_id, jp.query_id) not in (values ('0','1'))
order by target_reached_n_times ASC, jp.priority DESC, jp.cnt_of_judgements ASC, jp.document_id ASC, jp.query_id ASC
limit 3
