# Data example files and file structure

Inspect the files to see the predefined file structure and available values.

### `judgement_mode` of [`config.tsv`](config.tsv)

Can have the following values:

- `PLAIN_RELEVANCE_SCORING`: users must only give a score and cannot annotate text parts of the paragraph
- `SCORING_AND_SELECT_SPANS`: users must give a score and annotate text parts of the paragraph

### `priority` of `judgement-pairs.tsv`

Can have integer values and the value `all`.  
The higher the number, the higher is the priority.  
`all` is a special value. Fira will make sure that when a user reaches his annotation target, he annotated every judgement pair with priority `all` exactly once.
