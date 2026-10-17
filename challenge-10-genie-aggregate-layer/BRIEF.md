# Challenge 10: An aggregate-only analytic layer over patient-level GENIE data

Track: Healthcare (set by Sylvester Comprehensive Cancer Center), area: Precision medicine & drug discovery
Source: https://hackathon.miamiaihub.com/challenges (pulled 2026-10-17)
Box folder: https://miami.box.com/s/2kktjf4ag7zvlhspdngg8a97nyyo27go

Due to new U.S. federal regulations, data users from certain countries are barred from accessing individual patient-level data but may access aggregate or cohort-level data. Generate the codebase for an "analytic layer" that can be deployed on top of the line-level data to produce aggregate analyses for this user group, in Python or a Jupyter notebook. A good example to model: using the BPC_CRC dataset, let a user determine whether liver involvement and selected genomic features are associated with early treatment failure in metastatic colorectal cancer. Specifically:

a. The number of BPC CRC patients with metastatic colorectal cancer, stratified by liver metastasis status if available.
b. Among patients with liver metastasis, aggregate outcome summaries after first-line systemic therapy, such as early progression or treatment failure within approximately 6 or 9 months, if these endpoints are available.
c. Aggregate frequencies of key genomic alterations in the liver-metastasis subgroup, particularly APC, TP53, KRAS/NRAS, BRAF V600E, SMAD4, and MSI/MMR status if available.
d. If possible, a simple comparison of early outcome rates or survival summaries between liver-metastasis and non-liver-metastasis groups, or between selected genomic subgroups.

Requires completing the AACR GENIE Data Access request: https://miami.box.com/s/vzc7h5rbht8o6623jy58a3qblqnbpitn
