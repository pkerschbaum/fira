select * from document where id = 'D1128958_7';
delete from judgement_pair;
delete from query_version; delete from document_version;
delete from query; delete from document;
delete from judgement;

select * from document;
select * from query;
select * from document_version;
select * from query_version;
select * from judgement_pair;
select * from judgement;

delete from judgement where id=67;

select j.* from judgement j
left join judgement_pair jp on jp.document_id = j.document_document and jp.query_id = j.query_query
where jp.priority = 'all';