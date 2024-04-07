use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn init(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["terraform"])?
        .with_exec(vec!["terraform", "init", &args])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn validate(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["terraform"])?
        .with_exec(vec!["terraform", "validate", &args])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn plan(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["terraform"])?
        .with_exec(vec!["terraform", "plan", &args])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn apply(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["terraform"])?
        .with_exec(vec!["terraform", "apply", &args])?
        .stdout()?;
    Ok(stdout)
}
