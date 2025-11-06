export function GenotypeInfo() {
    
    return (<div className="div--expand padding--medium div--expand" style={{overflowY:"scroll"}}>
        <h2>Information</h2>
        <p className="margin-left--little">The nomenclature to describe a protein mutation follows guideline described by the <a href="https://hgvs-nomenclature.org/stable/recommendations/general/">HGVS</a>.
            Attention, the one letter code for amino acids is used instead of the three letter code.</p>
        <h2>Substitution</h2>
        <p className="margin-left--little">A Substitution is a sequence change where, compared to a reference sequence, one amino acid is replaced by one other amino acid.
        A substitution of the amino acid Arg 18 in Nudfs1 to Thr would be described as <strong>Ndufs1.R18T</strong>.</p>
        <h2>Insertions</h2>
        <h3>Amino acid sequence</h3>
        <p className="margin-left--little">Insertions describe an amino acid sequence that is introduced into the wild type protein amino acid sequence. 
            It starts with the amino acid and its position followed by an underscore an the sequence that is inserted. 
            As an example, adding the amino acids TRE at Arg 18 of Nudfs1 would be defined as <strong>Nudfs1.R18_TRE.</strong>
        </p>
        <h3>Tags</h3>
        <p className="margin-left--little">Multiple tags such as GFP, FLAG, His are available, for these common tags, instead of the amino acid sequence, the abbreviation is given.
            For example a N-terminal tag of Ndufs1 using Flag is defined by <strong>Flag_N.Ndufs1.</strong> while a tag at the C-terminus is defined by 
            <strong>Ndufs1.C_Flag</strong>.  A tag within the protein sequence (for example a His tag at Arg18) is given by Ndufs1.R18_His
        </p>
        <h2>Frameshift</h2>
        <p className="margin-left--little">A frameshift is a specific type of insertion leading to a premature stop codon. The protein mutation should be described by the first amino acid that is different followed by 'fs'.
            A frameshift at the position Arg 18 of the protein Ndufs1 would be defined as <strong>Ndufs1.R18fs</strong></p>
        <h2>Deletion</h2>
        <p className="margin-left--little">A deletion is a sequence change between the translation initiation (start) and termination (stop) codon where, compared to a reference sequence, one or more amino acids are not present (deleted).</p>
        <h3>Single amino acid</h3>
        <p className="margin-left--little">A single amino acid deletion is indicated by the Amino acids, its position a <strong>del</strong>. For example deleting Arg18 in Ndufs1 should be defined as <strong>Ndufs1.R15del</strong></p>
        
        <h3>Multiple amino acid</h3>
        <p className="margin-left--little">Deletion of a amino acid region is defined by start and end of the deletion (inclusive). Deletion in Ndufs1 from amino acid Arg18 to Thr 22
            would be define as <strong>Ndufs1.R18_T22del</strong>.
        </p>

        <h2>Combination</h2>
        <p className="margin-left--little">In case of multiple protein mutations, each mutation is given by its position within the protein.</p>
        <p className="margin-left--little">A protein deletion of R18-T22 and a C-terminal Flag tag are given by <strong>Ndufs1.R18-T22del.C_Flag</strong>.</p>
    </div>)
}